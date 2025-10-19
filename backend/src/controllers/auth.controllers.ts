import { Request, Response } from "express";
import { z } from "zod";
import { hashPassword, verifyPassword } from "../utils/password";
import {
  signAccessToken,
  signRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  validateStoredRefreshToken,
  rotateRefreshToken,
  revokeAllUserRefreshTokens,
  JwtPayload,
} from "../services/token.service";
import { config } from "../config";
import type { AuthRequest } from "../middleware/auth";
import { dbPool } from "../config/db";

// 회원가입 검증 스키마
const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

// 로그인 스키마
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// 리프레시 토큰 쿠키 설정
function setRefreshCookie(res: Response, token: string) {
  const decoded = ((): any => {
    // 만료일 계산을 위해 decode 사용(보안 영향 없음)
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    try {
      return JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
    } catch {
      return null;
    }
  })();

  // 만료시간이 있으면 maxAge 설정
  const maxAgeMs = decoded?.exp ? decoded.exp * 1000 - Date.now() : undefined;

  // 쿠키 설정
  res.cookie(config.cookie.name, token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: "none",
    path: config.cookie.path,
    maxAge: maxAgeMs,
  });
}

// 컨트롤러 구현
export const AuthController = {
  // 회원가입
  signup: async (req: Request, res: Response) => {
    // 요청 데이터 검증
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "Invalid input",
        errors: z.treeifyError(parsed.error),
      });

    // 요청 데이터 추출
    const { email, password, name } = parsed.data;

    // 이메일 중복 체크
    const [exists] = await dbPool.execute(
      "SELECT id FROM user WHERE email = ?",
      [email]
    );

    if (exists && (exists as any[]).length > 0) {
      return res.status(409).json({ message: "이미 등록된 이메일입니다." });
    }

    // 사용자 생성
    const hashedPassword = await hashPassword(password);
    const result = await dbPool
      .execute(
        "INSERT INTO user (email, password_hash, name) VALUES (?, ?, ?)",
        [email, hashedPassword, name]
      )
      .catch((err) => {
        switch (err.code) {
          case "ER_DUP_ENTRY":
            return res
              .status(409)
              .json({ message: "이미 등록된 이메일입니다." });
          default:
            break;
        }
        throw err;
      });
    const userId = (result as any).insertId;

    // 토큰 발급
    const accessToken = signAccessToken(userId.toString(), email);
    const refreshToken = signRefreshToken(userId.toString(), email);

    // 리프레시 토큰 저장 및 쿠키 설정
    await storeRefreshToken(
      userId.toString(),
      refreshToken,
      req.headers["user-agent"],
      req.ip
    );
    setRefreshCookie(res, refreshToken);

    // 성공 응답
    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      accessToken,
      user: { id: userId.toString(), email, name },
    });
  },

  // 로그인
  login: async (req: Request, res: Response) => {
    // 요청 데이터 검증
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        message: "올바르지 않은 요청입니다.",
        errors: z.treeifyError(parsed.error),
      });

    // 사용자 조회
    const { email, password } = parsed.data;
    const rows = await dbPool.execute(
      "SELECT id, password_hash, name FROM user WHERE email = ?",
      [email]
    );
    const user = (rows as any[])[0];

    // 사용자 존재 및 비밀번호 검증
    if (!user) {
      return res
        .status(401)
        .json({ message: "올바르지 않은 이메일 또는 비밀번호입니다." });
    }

    const ok = await verifyPassword(password, user.password_hash);
    if (!ok) {
      return res
        .status(401)
        .json({ message: "올바르지 않은 이메일 또는 비밀번호입니다." });
    }

    // 토큰 발급
    const accessToken = signAccessToken(user.id.toString(), email);
    const refreshToken = signRefreshToken(user.id.toString(), email);

    // 리프레시 토큰 저장 및 쿠키 설정
    await storeRefreshToken(
      user.id.toString(),
      refreshToken,
      req.headers["user-agent"],
      req.ip
    );
    setRefreshCookie(res, refreshToken);

    // 성공 응답
    return res.json({
      message: "성공적으로 로그인되었습니다!",
      accessToken,
      user: { id: user.id.toString(), email, name: user.name },
    });
  },

  // 토큰 갱신
  refresh: async (req: Request, res: Response) => {
    const token = req.cookies?.[config.cookie.name];
    if (!token)
      return res.status(401).json({ message: "리프레시 토큰이 없습니다." });

    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res
        .status(401)
        .json({ message: "유효하지 않거나 만료된 리프레시 토큰입니다." });
    }

    // DB에 저장된 토큰인지 검증
    const valid = await validateStoredRefreshToken(token, payload.userId);
    if (!valid)
      return res
        .status(401)
        .json({ message: "유효하지 않은 리프레시 토큰입니다." });

    // 이전 토큰 파기 후 새 리프레시 토큰 발급
    const newRefresh = await rotateRefreshToken(
      token,
      payload.userId,
      payload.email,
      req.headers["user-agent"],
      req.ip
    );
    setRefreshCookie(res, newRefresh);

    // 새 액세스 토큰 발급
    const newAccess = signAccessToken(payload.userId, payload.email);
    return res.json({ accessToken: newAccess });
  },

  // 내 정보 조회
  me: async (req: AuthRequest, res: Response) => {
    // requireAuth 미들웨어로 user 주입됨
    return res.json({ user: req.user });
  },

  // 로그아웃
  logout: async (req: Request, res: Response) => {
    const token = req.cookies?.[config.cookie.name];
    if (token) {
      try {
        const payload: JwtPayload = verifyRefreshToken(token);
        await revokeAllUserRefreshTokens(payload.userId);
      } catch {
        // 토큰이 이미 만료/변조라도 쿠키만 삭제
      }
    }
    res.clearCookie(config.cookie.name, { path: config.cookie.path });
    return res.json({ message: "로그아웃되었습니다." });
  },
};

import { CookieOptions, Request, Response } from "express";
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
  username: z.string().min(1).max(100),
});

// 로그인 스키마
const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// 리프레시 토큰 쿠키 설정
const setRefreshCookie = (res: Response, token: string) => {
  const decoded = ((): any => {
    // 만료일 계산을 위해 decode 사용(보안 영향 없음)
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }
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
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: config.cookie.path,
    maxAge: maxAgeMs,
  } as CookieOptions);
};

// 컨트롤러 구현
export const AuthController = {
  // 회원가입
  signup: async (req: Request, res: Response) => {
    // 요청 데이터 검증
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "올바르지 않은 요청입니다.",
      });
    }

    // 요청 데이터 추출
    const { email, password, username } = parsed.data;

    // 이메일 중복 체크
    const exists = await dbPool.execute("SELECT id FROM user WHERE email = ?", [
      email,
    ]);
    if (exists && (exists as any[]).length > 0) {
      return res.status(409).json({ message: "이미 등록된 이메일입니다." });
    }

    // 사용자 생성
    const hashedPassword = await hashPassword(password);
    const result = await dbPool
      .execute("INSERT INTO user (email, password, name) VALUES (?, ?, ?)", [
        email,
        hashedPassword,
        username,
      ])
      .catch((err) => {
        switch (err.code) {
          case "ER_DUP_ENTRY":
            return res
              .status(409)
              .json({ message: "이미 등록된 이메일입니다." });
          default:
            return res
              .status(400)
              .json({ message: "회원가입에 실패했습니다." });
        }
      });
    const userId = (result as any).insertId.toString();

    // 토큰 발급
    const accessToken = signAccessToken(userId, email);
    const refreshToken = signRefreshToken(userId, email);

    // 리프레시 토큰 저장 및 쿠키 설정
    await storeRefreshToken(
      userId,
      refreshToken,
      req.headers["user-agent"],
      req.ip
    );
    setRefreshCookie(res, refreshToken);

    // 성공 응답
    return res.status(201).json({
      message: "회원가입이 완료되었습니다.",
      accessToken,
      user: { id: userId, email, name: username },
    });
  },

  // 로그인
  login: async (req: Request, res: Response) => {
    // 요청 데이터 검증
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "올바르지 않은 요청입니다.",
      });
    }

    // 사용자 조회
    const { email, password } = parsed.data;
    const rows = await dbPool.execute(
      "SELECT id, password, name FROM user WHERE email = ?",
      [email]
    );
    const user = (rows as any[])[0];

    // 사용자 존재 여부 검증
    if (!user) {
      return res
        .status(401)
        .json({ message: "올바르지 않은 이메일 또는 비밀번호입니다." });
    }

    // 비밀번호 검증
    const isVerified = await verifyPassword(password, user.password);
    if (!isVerified) {
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

    // 마지막 로그인 시간 업데이트
    const result = await dbPool.execute(
      `UPDATE user
      SET last_login_at = NOW()
      WHERE id = ?`,
      [user.id]
    );

    // 성공 응답
    return res.json({
      message: "성공적으로 로그인되었습니다.",
      accessToken,
      user: { id: user.id.toString(), email, name: user.name },
    });
  },

  // 토큰 갱신
  refresh: async (req: Request, res: Response) => {
    // 쿠키에서 리프레시 토큰 추출
    const token = req.cookies?.[config.cookie.name];
    if (!token) {
      return res.status(401).json({ message: "토큰이 존재하지 않습니다." });
    }

    // 토큰 검증
    let payload: JwtPayload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      return res
        .status(401)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });
    }

    // DB에 저장된 토큰인지 검증
    const valid = await validateStoredRefreshToken(token, payload.userId);
    if (!valid)
      return res
        .status(401)
        .json({ message: "유효하지 않거나 만료된 토큰입니다." });

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
    // 쿠키에서 리프레시 토큰 추출
    const token = req.cookies?.[config.cookie.name];

    // 토큰이 있으면 DB에서 모두 폐기
    if (token) {
      try {
        const payload: JwtPayload = verifyRefreshToken(token);
        await revokeAllUserRefreshTokens(payload.userId);
      } catch {
        // 토큰이 이미 만료/변조라도 쿠키만 삭제
      }
    }

    // 쿠키 삭제
    res.clearCookie(config.cookie.name, { path: config.cookie.path });
    return res.json({ message: "로그아웃되었습니다." });
  },
};

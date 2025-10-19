import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { config } from "../config";
import { dbPool } from "../config/db";
import { hashToken, verifyTokenHash } from "../utils/password";
import dayjs from "dayjs";

export type JwtPayload = {
  userId: string;
  email: string;
};

// 액세스 토큰 서명
export const signAccessToken = (userId: string, email: string) => {
  const payload: JwtPayload = { userId, email };

  return jwt.sign(
    payload,
    config.jwt.secret as Secret,
    {
      algorithm: "HS256",
      expiresIn: config.jwt.accessTokenExpiresIn,
    } as SignOptions
  );
};

// 리프레시 토큰 서명
export function signRefreshToken(userId: string, email: string) {
  const payload: JwtPayload = { userId, email };

  return jwt.sign(
    payload,
    config.jwt.secret as Secret,
    {
      algorithm: "HS256",
      expiresIn: config.jwt.refreshTokenExpiresIn,
    } as SignOptions
  );
}

// 액세스 토큰 검증
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

// 리프레시 토큰 검증
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}

export async function storeRefreshToken(
  userId: string,
  refreshToken: string,
  userAgent?: string,
  ip?: string
) {
  const tokenHash = await hashToken(refreshToken);

  // 만료일 계산
  const now = dayjs();
  const delta = parseExpiry(config.jwt.refreshTokenExpiresIn);
  const expiresAt = now
    .add(delta.days ?? 0, "day")
    .add(delta.hours ?? 0, "hour")
    .add(delta.minutes ?? 0, "minute")
    .add(delta.seconds ?? 0, "second")
    .toDate(); // 네이티브 Date 형태로 변환

  // DB에 리프레시 토큰 저장
  await dbPool.execute(
    `INSERT INTO refresh_token (user_id, token_hash, expires_at, user_agent, ip)
     VALUES (?, ?, ?, ?, ?)`,
    [userId, tokenHash, expiresAt, userAgent ?? null, ip ?? null]
  );
}

// 리프레시 토큰 갱신
export async function rotateRefreshToken(
  oldToken: string,
  userId: string,
  email: string,
  userAgent?: string,
  ip?: string
) {
  // 기존 토큰 레코드 찾고 폐기
  const rows = await dbPool.execute(
    `SELECT id, token_hash
    FROM refresh_token
    WHERE user_id = ?
    ORDER BY id DESC
    LIMIT 20`,
    [userId]
  );

  // 요청한 oldToken과 매칭되는 해시를 찾아 삭제
  for (const r of rows) {
    if (await verifyTokenHash(oldToken, r.token_hash)) {
      await dbPool.execute(
        `DELETE FROM refresh_token
        WHERE id = ?`,
        [r.id]
      );
      break;
    }
  }

  // 새 토큰 발급 + 저장
  const newToken = signRefreshToken(userId, email);
  await storeRefreshToken(userId, newToken, userAgent, ip);

  return newToken;
}

// 모든 리프레시 토큰 폐기
export async function revokeAllUserRefreshTokens(userId: string) {
  await dbPool.execute(
    `DELETE FROM refresh_token
    WHERE user_id = ?`,
    [userId]
  );
  console.log(`모든 리프레시 토큰이 사용자 ${userId}에 대해 폐기되었습니다.`);
}

// 저장된 리프레시 토큰 검증
export async function validateStoredRefreshToken(
  token: string,
  userId: string
) {
  // 유효한 토큰 중 일치하는지 검사
  const rows = await dbPool.execute(
    `SELECT id, token_hash, expires_at
     FROM refresh_token
     WHERE user_id = ? AND expires_at > NOW()
     ORDER BY id DESC LIMIT 50`,
    [userId]
  );

  for (const r of rows) {
    if (await verifyTokenHash(token, r.token_hash)) {
      return true;
    }
  }
  return false;
}

// 만료 기간 파싱
function parseExpiry(expiry: string): {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
} {
  const m = expiry.match(/^(\d+)([smhd])$/);
  if (!m) return { days: 30 };
  const n = Number(m[1]);
  const u = m[2];
  if (u === "s") return { seconds: n };
  if (u === "m") return { minutes: n };
  if (u === "h") return { hours: n };
  if (u === "d") return { days: n };
  return { days: 30 };
}

import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth";
import { csrfTokenManager } from "../utils/csrfTokenManager";
import { config } from "../config";
import { verifyRefreshToken } from "../services/token.service";

// requiredAuth와 함께 사용하는 CSRF 토큰 검증 미들웨어
export const verifyCsrfToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const csrfToken = req.headers["x-csrf-token"];

  // CSRF 토큰 포함 여부 확인
  if (!csrfToken) {
    return res.status(403).json({ message: "CSRF 토큰이 없습니다." });
  }

  // 인증된 사용자 확인
  if (!req.user?.id) {
    return res.status(401).json({ message: "인증되지 않은 요청입니다." });
  }

  // CSRF 토큰 유효성 검사
  const isCsrfTokenValid = csrfTokenManager.validateToken(
    req.user.id,
    csrfToken as string
  );
  if (!isCsrfTokenValid) {
    return res.status(403).json({ message: "유효하지 않은 CSRF 토큰입니다." });
  }

  next();
};

// Refresh 전용 CSRF 미들웨어 (쿠키에서 인증 정보 추출)
export const verifyCsrfForRefresh = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const csrfToken = req.headers["x-csrf-token"];
  const refreshToken = req.cookies?.[config.cookie.name];

  if (!csrfToken) {
    return res.status(403).json({ message: "CSRF 토큰이 없습니다." });
  }

  if (!refreshToken) {
    return res.status(401).json({ message: "리프레시 토큰이 없습니다." });
  }

  try {
    // 쿠키에서 리프레시 토큰 검증
    const payload = verifyRefreshToken(refreshToken);

    // CSRF 토큰 검증
    const isCsrfTokenValid = csrfTokenManager.validateToken(
      payload.userId,
      csrfToken as string
    );
    if (!isCsrfTokenValid) {
      return res
        .status(403)
        .json({ message: "유효하지 않은 CSRF 토큰입니다." });
    }

    next();
  } catch {
    return res
      .status(401)
      .json({ message: "유효하지 않은 리프레시 토큰입니다." });
  }
};

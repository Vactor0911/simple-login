import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../services/token.service";

export interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

export function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "인증 헤더가 없거나 올바르지 않습니다." });
  }
  const token = header.slice("Bearer ".length);
  try {
    const payload = verifyAccessToken(token);
    req.user = { id: Number(payload.email), email: payload.email };
    next();
  } catch {
    return res
      .status(401)
      .json({ message: "유효하지 않거나 만료된 액세스 토큰입니다." });
  }
}

import bcrypt from "bcrypt";

const ROUNDS = 12; // 솔트 라운드 횟수

export const hashPassword = async (plain: string) => {
  return bcrypt.hash(plain, ROUNDS);
}

export const verifyPassword = async (plain: string, hash: string) => {
  return bcrypt.compare(plain, hash);
}

export const hashToken = async (token: string) => {
  // refresh token 해시용
  return bcrypt.hash(token, ROUNDS);
}

export const verifyTokenHash = async (token: string, hash: string) => {
  return bcrypt.compare(token, hash);
}

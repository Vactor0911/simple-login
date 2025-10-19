import bcrypt from "bcrypt";

const ROUNDS = 12; // 솔트 라운드 횟수

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function hashToken(token: string) {
  // refresh token 해시용
  return bcrypt.hash(token, ROUNDS);
}

export async function verifyTokenHash(token: string, hash: string) {
  return bcrypt.compare(token, hash);
}

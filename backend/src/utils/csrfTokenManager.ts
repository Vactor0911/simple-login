import crypto from "crypto";

class CsrfTokenManager {
  private tokens: Map<
    string,
    { token: string; expiresAt: number; createdAt: number }
  >; // CSRF 토큰 메모리 저장소
  private tokenExpiry: number; // 토큰 만료 시간
  private cleanupInterval: number; // 만료된 토큰 정리 간격
  private cleanupTimer?: NodeJS.Timeout; // CSRF 정리 타이머

  constructor(options: { tokenExpiry?: number; cleanupInterval?: number }) {
    this.tokens = new Map();
    this.tokenExpiry = options.tokenExpiry || 24 * 60 * 60 * 1000; // 기본 만료 시간: 24시간
    this.cleanupInterval = options.cleanupInterval || 60 * 60 * 1000; // 기본 정리 간격: 1시간

    // 주기적으로 만료된 토큰 정리
    this._startCleanup();
  }

  /**
   * CSRF 토큰 생성
   * @param userEmail 사용자 이메일
   * @returns 생성된 CSRF 토큰
   */
  generateToken(userEmail: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + this.tokenExpiry;

    this.tokens.set(userEmail, {
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return token;
  }

  /**
   * CSRF 토큰 유효성 검증
   * @param userEmail 사용자 이메일
   * @param token 검증할 CSRF 토큰
   * @returns 토큰이 유효한지 여부
   */
  validateToken(userEmail: string, token: string): boolean {
    // 파라미터 검증
    if (!userEmail || !token) {
      return false;
    }

    // 토큰 저장 여부 검증
    const storedToken = this.tokens.get(userEmail);
    if (!storedToken) {
      return false;
    }

    // 토큰 만료 여부 검증
    if (Date.now() > storedToken.expiresAt) {
      this.deleteToken(userEmail);
      return false;
    }

    // 토큰 비교
    try {
      return crypto.timingSafeEqual(
        Buffer.from(storedToken.token),
        Buffer.from(token)
      );
    } catch {
      return false;
    }
  }

  /**
   * CSRF 토큰 삭제
   * @param userEmail 사용자 이메일
   */
  deleteToken(userEmail: string) {
    this.tokens.delete(userEmail);
  }

  /**
   * 특정 사용자 토큰 갱신
   * @param userEmail 사용자 ID
   * @returns 갱신된 CSRF 토큰
   */
  refreshToken(userEmail: string): string {
    this.deleteToken(userEmail);
    return this.generateToken(userEmail);
  }

  /**
   * 모든 CSRF 토큰 삭제
   */
  clearAllTokens() {
    this.tokens.clear();
  }

  /**
   * 만료된 CSRF 토큰 정리
   * @private
   */
  private _cleanupExpiredTokens() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [userId, token] of this.tokens.entries()) {
      if (now > token.expiresAt) {
        this.tokens.delete(userId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `[CSRF Token Manager] ${cleanedCount}개의 만료된 CSRF 토큰을 정리했습니다.`
      );
    }
  }

  /**
   * CSRF 토큰 정리 타이머 시작
   * @private
   */
  private _startCleanup() {
    this.cleanupTimer = setInterval(() => {
      this._cleanupExpiredTokens();
    }, this.cleanupInterval);

    // Node.js 프로세스 종료 시 타이머 정리
    process.on("SIGTERM", () => this._stopCleanup());
    process.on("SIGINT", () => this._stopCleanup());
  }

  /**
   * CSRF 토큰 정리 타이머 중지
   * @private
   */
  private _stopCleanup() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      console.log("[CSRF Token Manager] CSRF 토큰 정리 타이머가 중지되었습니다.");
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const csrfTokenManager = new CsrfTokenManager({
  tokenExpiry: 24 * 60 * 60 * 1000, // 24시간
  cleanupInterval: 60 * 60 * 1000, // 1시간마다 토큰 정리
});

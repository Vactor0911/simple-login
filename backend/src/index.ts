import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import { csrfTokenManager } from "./utils/csrfTokenManager";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://vactor0911.github.io"
        : `http://localhost:8080`,
    credentials: true, // 쿠키 전송 허용
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  })
);

// API
app.use("/api/auth", authRoutes);

// 헬스체크
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`[SERVER] 서버가 ${config.port}번 포트에서 실행 중입니다.`);
});

// 프로세스 종료 시 CSRF 토큰 정리
process.on("SIGTERM", () => {
  console.log("모든 CSRF 토큰을 정리합니다...");
  csrfTokenManager.clearAllTokens();
  process.exit(0);
});

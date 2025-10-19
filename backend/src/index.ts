import express from "express";
import cookieParser from "cookie-parser";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());
app.use(cookieParser());

// API
app.use("/api/auth", authRoutes);

// 헬스체크
app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(config.port, () => {
  console.log(`[server] listening on http://localhost:${config.port}`);
});

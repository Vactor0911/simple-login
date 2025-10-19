import "dotenv/config";

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",

  jwt: {
    secret: process.env.JWT_SECRET!,
    accessTokenExpiresIn: process.env.ACCESS_TOKEN_EXPIRES!,
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES!,
  },
  cookie: {
    name: process.env.REFRESH_COOKIE_NAME ?? "refresh_token",
    secure: true,
    sameSite: "none",
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60, // 7일
    path: "/api/auth",
  },
  db: {
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
  },
};

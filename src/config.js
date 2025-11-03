const dotenv = require("dotenv");
dotenv.config();

const config = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || "dev-access-secret",
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || "dev-refresh-secret",
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || "10m",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || "7d",
  cors: {
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: false,
  },
};

module.exports = config;

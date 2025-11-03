const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const config = require("./config");

// In-memory refresh token store: jti -> record
// record: { jti, userId, expiresAt, revoked }
const refreshStore = new Map();

function signAccessToken(payload) {
  return jwt.sign(payload, config.accessTokenSecret, {
    expiresIn: config.accessTokenTtl,
    issuer: "auth-backend",
    audience: payload.sub,
  });
}

function signRefreshToken(payload, jti) {
  return jwt.sign({ ...payload, jti }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenTtl,
    issuer: "auth-backend",
    audience: payload.sub,
  });
}

function verifyAccessToken(token) {
  return jwt.verify(token, config.accessTokenSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, config.refreshTokenSecret);
}

function nowMs() {
  return Date.now();
}

function msFromNow(durationMs) {
  return nowMs() + durationMs;
}

function parseJwtExpToMs(ttl) {
  // ttl can be like '10m', '7d', etc; use jwt library semantics via sign+decode to compute exp
  const dummy = jwt.sign({ t: 1 }, "x", { expiresIn: ttl });
  const decoded = jwt.decode(dummy);
  return decoded.exp * 1000 - nowMs();
}

function createSessionForUser(user) {
  const jti = uuidv4();
  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload, jti);

  const ttlMs = parseJwtExpToMs(config.refreshTokenTtl);
  refreshStore.set(jti, {
    jti,
    userId: user.id,
    expiresAt: msFromNow(ttlMs),
    revoked: false,
  });

  return { accessToken, refreshToken, jti };
}

function revokeRefreshJti(jti) {
  const rec = refreshStore.get(jti);
  if (rec) {
    rec.revoked = true;
    refreshStore.set(jti, rec);
  }
}

function isRefreshUsable(jti) {
  const rec = refreshStore.get(jti);
  if (!rec) return false;
  if (rec.revoked) return false;
  if (rec.expiresAt <= nowMs()) return false;
  return true;
}

function rotateRefreshToken(oldJti, user) {
  revokeRefreshJti(oldJti);
  const { accessToken, refreshToken, jti } = createSessionForUser(user);
  return { accessToken, refreshToken, jti };
}

module.exports = {
  createSessionForUser,
  verifyAccessToken,
  verifyRefreshToken,
  revokeRefreshJti,
  isRefreshUsable,
  rotateRefreshToken,
};

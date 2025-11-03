const express = require("express");
const router = express.Router();

const { findUserByEmail, verifyPassword } = require("../users");
const {
  createSessionForUser,
  verifyRefreshToken,
  isRefreshUsable,
  rotateRefreshToken,
  revokeRefreshJti,
} = require("../tokenService");

// POST /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const user = findUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await verifyPassword(user, password);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const { accessToken, refreshToken } = createSessionForUser(user);
  return res.json({
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, name: user.name },
  });
});

// POST /auth/refresh
router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken)
    return res.status(400).json({ error: "refreshToken is required" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const oldJti = payload.jti;
    if (!oldJti || !isRefreshUsable(oldJti)) {
      return res
        .status(403)
        .json({ error: "Refresh token revoked or expired" });
    }
    const user = { id: payload.sub, email: payload.email };
    const rotated = rotateRefreshToken(oldJti, user);
    return res.json({
      accessToken: rotated.accessToken,
      refreshToken: rotated.refreshToken,
    });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  const { refreshToken } = req.body || {};
  if (!refreshToken)
    return res.status(400).json({ error: "refreshToken is required" });
  try {
    const payload = verifyRefreshToken(refreshToken);
    if (payload.jti) revokeRefreshJti(payload.jti);
    return res.status(204).send();
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
});

module.exports = router;

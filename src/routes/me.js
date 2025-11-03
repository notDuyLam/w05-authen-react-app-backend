const express = require("express");
const router = express.Router();
const { requireAccessToken } = require("../authMiddleware");

router.get("/", requireAccessToken, (req, res) => {
  return res.json({
    id: req.user.id,
    email: req.user.email,
    name: "Demo User",
  });
});

module.exports = router;

const express = require("express");
const cors = require("cors");
const config = require("./config");

const authRoutes = require("./routes/auth");
const meRoutes = require("./routes/me");

const app = express();

app.use(cors(config.cors));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/me", meRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.listen(config.port, () => {
  console.log(`Auth backend listening on http://localhost:${config.port}`);
});

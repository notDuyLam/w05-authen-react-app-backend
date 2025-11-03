const bcrypt = require("bcryptjs");

// Simple in-memory user store with one demo user
// Password: "password123"
const demoUser = {
  id: "u_1",
  email: "demo@example.com",
  name: "Demo User",
  // Pre-hash synchronously on startup for simplicity
  passwordHash: bcrypt.hashSync("password123", 10),
};

const usersByEmail = new Map([[demoUser.email, demoUser]]);

function findUserByEmail(email) {
  return usersByEmail.get(email) || null;
}

async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.passwordHash);
}

module.exports = {
  findUserByEmail,
  verifyPassword,
};

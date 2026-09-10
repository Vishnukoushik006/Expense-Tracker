const express = require("express");
const router = express.Router();
const User = require("../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
require("../config/passport"); // register the Google strategy

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

// ─── Helper ────────────────────────────────────────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ─── Email / Password Signup ───────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashed, name: name || email.split("@")[0] });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Email / Password Login ────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    if (!user.password) {
      return res.status(400).json({ message: "This account uses Google sign-in" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Wrong password" });

    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, email: user.email, name: user.name, avatar: user.avatar },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ─── Google OAuth – Start ──────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

// ─── Google OAuth – Callback ───────────────────────────────────────────────────
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}?auth=failed` }),
  (req, res) => {
    const token = signToken(req.user._id);
    const userData = encodeURIComponent(
      JSON.stringify({
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        avatar: req.user.avatar,
      })
    );
    // Redirect back to frontend with token in query string
    res.redirect(`${FRONTEND_URL}?token=${token}&user=${userData}`);
  }
);

// ─── Get current user (verify token) ──────────────────────────────────────────
router.get("/me", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  try {
    const decoded = jwt.verify(authHeader.split(" ")[1], process.env.JWT_SECRET);
    res.json({ userId: decoded.id });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

module.exports = router;
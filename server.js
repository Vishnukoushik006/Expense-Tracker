const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
const authRoutes = require("./routes/authRoutes");
const session = require("express-session");
require("dotenv").config();

const app = express();

// Connect to MongoDB
connectDB();

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());

// Session (required by Passport internally even in sessionless mode)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "expense_tracker_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Logger
app.use((req, res, next) => {
  console.log("=> Incoming request:", req.method, req.url);
  next();
});

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 8005;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
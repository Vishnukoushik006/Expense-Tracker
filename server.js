const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const expenseRoutes = require("./routes/expenseRoutes");
require("dotenv").config();
const app = express();

connectDB();

// middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
  console.log("=> Incoming request:", req.method, req.url);
  next();
});

// routes
app.use("/api/expenses", expenseRoutes);

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

app.listen(8005, () => {
  console.log("Server running on port 8005");
});
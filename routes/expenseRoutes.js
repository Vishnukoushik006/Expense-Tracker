const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");
const authMiddleware = require("../middleware/authMiddleware");

// 🔐 ADD expense (protected)
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const newExpense = new Expense({
      ...req.body,
      userId: req.userId
    });

    const saved = await newExpense.save();
    res.json(saved);
  } catch (error) {
    console.log("❌ Error:", error);
    res.status(500).json({ error: error.message });
  }
});


// 🔐 GET all expenses (user-specific)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔐 DELETE expense (only own data)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    res.json({ message: "Expense deleted", deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 🔐 UPDATE expense (only own data)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
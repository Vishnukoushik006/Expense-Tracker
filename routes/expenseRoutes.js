const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// ADD expense
router.post("/add", async (req, res) => {
    console.log("=> Request received");   // ADD THIS
  console.log(req.body); 
  try {
    const expense = new Expense(req.body);
    const saved = await expense.save();
    res.json(saved);
  } catch (error) {
    console.log("❌ Error:", error);  
    res.status(500).json({ error: error.message });
  }
});


// GET all expenses
router.get("/", async (req, res) => {
  try {
    const expenses = await Expense.find();
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    res.json({ message: "Expense deleted", deleted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// UPDATE expense
router.put("/:id", async (req, res) => {
  try {
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
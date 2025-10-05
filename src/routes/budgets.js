import express from "express";
import Budget from "../models/Budget.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all routes with authentication middleware
router.use(protect);

//  Get all budgets for the logged-in user
router.get("/", async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user.id });
    res.json(budgets);
  } catch (err) {
    console.error("Get Budgets Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add a new budget
router.post("/", async (req, res) => {
  const { category, limit, period } = req.body;

  if (!category || !limit) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const newBudget = new Budget({
      userId: req.user.id,
      category,
      limit,
      period: period || "monthly",
    });

    const savedBudget = await newBudget.save();
    res.json(savedBudget);
  } catch (err) {
    console.error("Add Budget Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Update an existing budget
router.put("/:id", async (req, res) => {
  try {
    const updatedBudget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!updatedBudget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json(updatedBudget);
  } catch (err) {
    console.error("Update Budget Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

//  Delete a budget
router.delete("/:id", async (req, res) => {
  try {
    const deletedBudget = await Budget.deleteOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (deletedBudget.deletedCount === 0) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Delete Budget Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;

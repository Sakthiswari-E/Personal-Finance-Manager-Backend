import express from "express";
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import protect from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// GET /api/reports/expenses?start=YYYY-MM-DD&end=YYYY-MM-DD&category=Groceries
router.get("/expenses", async (req, res) => {
  const user = req.user._id;
  const { start, end, category } = req.query;
  const match = {
    user: mongoose.Types.ObjectId(user),
    date: { $gte: new Date(start), $lte: new Date(end) },
  };
  if (category) match.category = category;

  const list = await Expense.find(match).sort({ date: -1 });
  const agg = await Expense.aggregate([
    { $match: match },
    { $group: { _id: "$category", total: { $sum: "$amount" } } },
    { $sort: { total: -1 } },
  ]);
  res.json({ list, byCategory: agg });
});

// Budget report: compare budgets with actuals
router.get("/budgets", async (req, res) => {
  const user = req.user._id;
  const budgets = await Budget.find({ user });
  // For each budget compute spent in its category for its timeframe (or month)
  const reports = [];
  for (const b of budgets) {
    const spent = await Expense.aggregate([
      {
        $match: {
          user: mongoose.Types.ObjectId(user),
          category: b.category,
          date: {
            $gte: b.startDate || new Date(0),
            $lte: b.endDate || new Date(),
          },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalSpent = (spent[0] && spent[0].total) || 0;
    reports.push({
      budget: b,
      spent: totalSpent,
      variance: b.limit - totalSpent,
    });
  }
  res.json(reports);
});

export default router;

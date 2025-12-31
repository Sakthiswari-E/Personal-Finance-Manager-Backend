// // backend/routes/budgets.js
// import express from "express";
// import mongoose from "mongoose";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import { protect } from "../middleware/authMiddleware.js"; 
// import Notification from "../models/Notification.js";

// const router = express.Router();

// // Development mode helper (optional)
// const DEV_MODE = process.env.DEV_MODE === "true";
// const DEV_USER_ID = new mongoose.Types.ObjectId("000000000000000000000000");

// router.post("/", protect, async (req, res) => {
//   try {
//     const userId = DEV_MODE ? DEV_USER_ID : req.user?._id;
//     const { category, amount, limit, period } = req.body;
//     const budgetAmount = amount || limit;

//     if (!category || !budgetAmount) {
//       return res.status(400).json({ message: "Category and amount are required." });
//     }

//     const newBudget = new Budget({
//       user: userId,
//       category,
//       amount: budgetAmount,
//       period: period || "monthly",
//     });

//     const saved = await newBudget.save();
//     res.status(201).json(saved);
//   } catch (err) {
//     console.error("❌ Error creating budget:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.get("/", protect, async (req, res) => {
//   try {
//     const userId = DEV_MODE ? DEV_USER_ID : req.user?._id;

//     const budgets = await Budget.find({ user: userId }).lean();

//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     const expenses = await Expense.aggregate([
//       {
//         $match: {
//           user: new mongoose.Types.ObjectId(userId),
//           date: { $gte: startOfMonth, $lte: endOfMonth },
//         },
//       },
//       { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } },
//     ]);

//     const spentMap = Object.fromEntries(expenses.map(e => [e._id, e.totalSpent]));

//     for (const b of budgets) {
//       const spent = spentMap[b.category] || 0;
//       const usagePercent = (spent / b.amount) * 100;

//       if (usagePercent >= 80) {
//         await Notification.create({
//           userId: userId,
//           type: "budget",
//           message: `⚠️ Your "${b.category}" budget has reached ${Math.round(
//             usagePercent
//           )}%`,
//         });
//       }
//     }

//     const response = budgets.map((b) => ({
//       ...b,
//       spentThisPeriod: spentMap[b.category] || 0,
//       remaining: (b.amount || 0) - (spentMap[b.category] || 0),
//     }));

//     res.json(response);
//   } catch (err) {
//     console.error("❌ Error getting budgets:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.put("/:id", protect, async (req, res) => {
//   try {
//     const userId = DEV_MODE ? DEV_USER_ID : req.user?._id;
//     const updated = await Budget.findOneAndUpdate(
//       { _id: req.params.id, user: userId },
//       req.body,
//       { new: true }
//     );
//     if (!updated) return res.status(404).json({ message: "Budget not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating budget:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const userId = DEV_MODE ? DEV_USER_ID : req.user?._id;
//     const deleted = await Budget.findOneAndDelete({ _id: req.params.id, user: userId });

//     if (!deleted) return res.status(404).json({ message: "Budget not found" });

//     res.json({ message: "✅ Budget deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting budget:", err);
//     res.status(500).json({ message: err.message });
//   }
// });

// export default router;






// backend/routes/budgets.js
import express from "express";
import mongoose from "mongoose";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, amount, limit, period = "monthly" } = req.body;
    const budgetAmount = amount || limit;

    if (!category || !budgetAmount) {
      return res.status(400).json({ message: "Category and amount required" });
    }

    // ✅ CHECK EXISTING BUDGET FIRST
    let budget = await Budget.findOne({
      user: userId,
      category,
      period,
    });

    if (budget) {
      budget.amount = budgetAmount;
      await budget.save();
      return res.json(budget);
    }

    // 🆕 CREATE ONLY IF NOT EXISTS
    budget = await Budget.create({
      user: userId,
      category,
      amount: budgetAmount,
      period,
    });

    res.status(201).json(budget);
  } catch (err) {
    console.error("❌ Budget error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const budgets = await Budget.find({ user: userId }).lean();

    const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    const expenses = await Expense.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
    ]);

    const spentMap = Object.fromEntries(expenses.map(e => [e._id, e.total]));

    res.json(
      budgets.map(b => ({
        ...b,
        spentThisPeriod: spentMap[b.category] || 0,
        remaining: b.amount - (spentMap[b.category] || 0),
      }))
    );
  } catch (err) {
    console.error("❌ Budget fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", protect, async (req, res) => {
  const updated = await Budget.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Budget not found" });
  res.json(updated);
});

router.delete("/:id", protect, async (req, res) => {
  const deleted = await Budget.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!deleted) return res.status(404).json({ message: "Budget not found" });
  res.json({ message: "Budget deleted" });
});

export default router;

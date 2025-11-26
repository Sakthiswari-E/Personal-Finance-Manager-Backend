// //backend\controllers\budgetController.js
// import mongoose from "mongoose";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";

// const DEV_MODE = process.env.DEV_MODE === "true";
// const DEV_USER_ID = new mongoose.Types.ObjectId("000000000000000000000000");

// function getUserId(req) {
//   return DEV_MODE ? DEV_USER_ID : req.user?._id || req.user?.id;
// }

// /**
//  * @desc    Create a new budget
//  * @route   POST /api/budgets
//  * @access  Private
//  */
// export const createBudget = async (req, res) => {
//   try {
//     const userId = getUserId(req);
//     const {
//       category,
//       amount,
//       description,
//       period,
//       startDate,
//       endDate,
//       alertThreshold,
//       color,
//       notificationsEnabled,
//     } = req.body;

//     const budgetAmount = Number(amount);
//     if (!category || !budgetAmount) {
//       return res.status(400).json({ message: "Category and amount are required." });
//     }

//     // 🔍 Prevent duplicate budgets for same category+period
//     const existing = await Budget.findOne({
//       user: userId,
//       category: new RegExp(`^${category}$`, "i"),
//       period: period || "monthly",
//     });

//     if (existing) {
//       return res
//         .status(400)
//         .json({ message: "A budget for this category and period already exists." });
//     }

//     const newBudget = await Budget.create({
//       user: userId,
//       category: category.trim(),
//       amount: budgetAmount,
//       description: description?.trim() || "",
//       period: period || "monthly",
//       startDate,
//       endDate,
//       alertThreshold,
//       color,
//       notificationsEnabled,
//     });

//     res.status(201).json(newBudget);
//   } catch (err) {
//     console.error("❌ Error creating budget:", err);
//     res.status(500).json({ message: "Server error creating budget" });
//   }
// };

// /**
//  * @desc    Get all budgets with calculated spent, remaining & percent used
//  * @route   GET /api/budgets
//  * @access  Private
//  */
// export const getBudgets = async (req, res) => {
//   try {
//     const userId = getUserId(req);
//     if (!userId) return res.status(401).json({ message: "Unauthorized" });

//     const budgets = await Budget.find({ user: userId }).lean();
//     if (budgets.length === 0) return res.json([]);

//     // 🔹 Define current period range (month by default)
//     const now = new Date();
//     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

//     // 🔹 Fetch user expenses within this period
//     const expenses = await Expense.aggregate([
//       {
//         $match: {
//           user: new mongoose.Types.ObjectId(userId),
//           date: { $gte: startOfMonth, $lte: endOfMonth },
//         },
//       },
//       { $group: { _id: "$category", totalSpent: { $sum: "$amount" } } },
//     ]);

//     // 🔹 Convert to lookup table
//     const spentMap = {};
//     expenses.forEach((e) => {
//       if (e._id) spentMap[e._id.toLowerCase()] = e.totalSpent;
//     });

//     // 🔹 Merge with budgets
//     const result = budgets.map((b) => {
//       const spent = spentMap[b.category?.toLowerCase()] || 0;
//       const remaining = Math.max(0, (b.amount || 0) - spent);
//       const percentUsed =
//         b.amount > 0 ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;

//       return {
//         ...b,
//         spentThisPeriod: spent,
//         remaining,
//         percentUsed,
//       };
//     });

//     res.status(200).json(result);
//   } catch (err) {
//     console.error("❌ Error fetching budgets:", err);
//     res.status(500).json({ message: "Server error fetching budgets" });
//   }
// };

// /**
//  * @desc    Update an existing budget
//  * @route   PUT /api/budgets/:id
//  * @access  Private
//  */
// export const updateBudget = async (req, res) => {
//   try {
//     const userId = getUserId(req);
//     const { id } = req.params;

//     const updated = await Budget.findOneAndUpdate(
//       { _id: id, user: userId },
//       { $set: req.body },
//       { new: true, runValidators: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Budget not found" });

//     res.status(200).json(updated);
//   } catch (err) {
//     console.error("❌ Error updating budget:", err);
//     res.status(500).json({ message: "Server error updating budget" });
//   }
// };

// /**
//  * @desc    Delete a budget
//  * @route   DELETE /api/budgets/:id
//  * @access  Private
//  */
// export const deleteBudget = async (req, res) => {
//   try {
//     const userId = getUserId(req);

//     const deleted = await Budget.findOneAndDelete({
//       _id: req.params.id,
//       user: userId,
//     });

//     if (!deleted) return res.status(404).json({ message: "Budget not found" });

//     res.json({ message: "✅ Budget deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting budget:", err);
//     res.status(500).json({ message: "Server error deleting budget" });
//   }
// };











// backend/controllers/budgetController.js
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Notification from "../models/Notification.js";

// Helper: start-end of current month
const getMonthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// Helper: create notification once per month per budget per level
async function sendBudgetNotification(userId, budgetId, level, percent, category) {
  const key = `${budgetId}-${level}-${new Date().getMonth()}-${new Date().getFullYear()}`;

  // Prevent duplicates: check if alert already exists this month
  const exists = await Notification.findOne({
    user: userId,
    type: "budget",
    "meta.key": key,
  });

  if (exists) return;

  const messages = {
    80: `⚠️ Your "${category}" budget is 80% used (${percent}%).`,
    90: `🚨 Your "${category}" budget is 90% used (${percent}%).`,
    100: `💥 Budget EXCEEDED for "${category}" (${percent}%)!`,
  };

  await Notification.create({
    user: userId,
    title: "Budget Alert",
    message: messages[level],
    type: "budget",
    meta: { key, budgetId, percent, level },
  });
}

// Main notifier: check usage & trigger alerts
async function checkBudgetNotifications(userId, budget) {
  const { start, end } = getMonthRange();

  const totalSpent = await Expense.aggregate([
    {
      $match: {
        user: budget.user,
        category: budget.category,
        date: { $gte: start, $lte: end },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const spent = totalSpent.length > 0 ? totalSpent[0].total : 0;
  const percent = Math.round((spent / budget.limit) * 100);

  if (percent >= 100) {
    await sendBudgetNotification(userId, budget._id, 100, percent, budget.category);
  } else if (percent >= 90) {
    await sendBudgetNotification(userId, budget._id, 90, percent, budget.category);
  } else if (percent >= 80) {
    await sendBudgetNotification(userId, budget._id, 80, percent, budget.category);
  }
}

/* ============================================================
   CONTROLLERS
============================================================ */

// GET all budgets
export const getBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user._id });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CREATE a new budget
export const createBudget = async (req, res) => {
  try {
    const { category, limit } = req.body;

    const existing = await Budget.findOne({
      user: req.user._id,
      category,
    });

    if (existing) {
      return res.status(400).json({ message: "Budget for this category already exists" });
    }

    const budget = await Budget.create({
      user: req.user._id,
      category,
      limit,
    });

    // Immediately check for notifications
    await checkBudgetNotifications(req.user._id, budget);

    res.status(201).json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE budget
export const updateBudget = async (req, res) => {
  try {
    const { limit } = req.body;
    const budget = await Budget.findById(req.params.id);

    if (!budget) return res.status(404).json({ message: "Budget not found" });

    budget.limit = limit ?? budget.limit;
    await budget.save();

    // Recalculate notifications after update
    await checkBudgetNotifications(req.user._id, budget);

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE budget
export const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    await budget.deleteOne();
    res.json({ message: "Budget removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET single budget
export const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.status(404).json({ message: "Budget not found" });

    res.json(budget);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

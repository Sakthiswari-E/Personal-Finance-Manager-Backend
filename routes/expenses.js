// backend/routes/expenses.js
import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET /api/expenses/filter
 * Apply filters: category + startDate + endDate
 */
/**
 * POST /api/expenses/filter
 * Apply filters: category + startDate + endDate
 */
router.post("/filter", protect, async (req, res) => {
  try {
    const { category, startDate, endDate } = req.body;

    let query = { user: req.user._id };

    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const filtered = await Expense.find(query).sort({ date: -1 });

    res.status(200).json(filtered);
  } catch (err) {
    console.error("❌ Error filtering expenses:", err);
    res.status(500).json({ message: "Server error filtering expenses" });
  }
});


/**
 * GET /api/expenses
 *  Fetch only the logged-in user's expenses
 */
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("❌ Error fetching expenses:", err.message);
    res.status(500).json({ message: "Server error fetching expenses" });
  }
});

/**
 * POST /api/expenses
 *  Create a new expense for the logged-in user
 * Handles recurring expense logic
 * DEV_MODE fallback for testing
 */
router.post("/", protect, async (req, res) => {
  try {
    const { amount, category } = req.body;
    if (!amount || !category) {
      return res.status(400).json({ message: "Amount and category required" });
    }

    if (req.body._id) delete req.body._id;
    if (!req.body.date) req.body.date = new Date();

    req.body.user = req.user?._id || req.body.user;

    if (!req.body.user && process.env.DEV_MODE === "true") {
      req.body.user = "000000000000000000000000";
    }

    if (req.body.isRecurring) {
      const now = new Date();
      switch (req.body.recurrenceInterval) {
        case "daily":
          req.body.nextRecurrenceDate = new Date(now.setDate(now.getDate() + 1));
          break;
        case "weekly":
          req.body.nextRecurrenceDate = new Date(now.setDate(now.getDate() + 7));
          break;
        case "monthly":
          req.body.nextRecurrenceDate = new Date(now.setMonth(now.getMonth() + 1));
          break;
        default:
          req.body.nextRecurrenceDate = null;
      }
    } else {
      req.body.recurrenceInterval = "none";
      req.body.nextRecurrenceDate = null;
    }

    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    console.error("❌ Error creating expense:", err.message, err.stack);
    res.status(500).json({ message: "Internal server error: " + err.message });
  }
});

/**
 * PUT /api/expenses/:id
 *  Update an existing expense (only if it belongs to the user)
 */
router.put("/:id", protect, async (req, res) => {
  try {
    const updated = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("❌ Error updating expense:", err);
    res.status(500).json({ message: err.message });
  }
});

/**
 * DELETE /api/expenses/:id
 *  Delete expense only if it belongs to the user
 */
router.delete("/:id", protect, async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Expense not found or unauthorized" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting expense:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;

import express from "express";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";
import { runRecurringProcessing } from "../scheduler/recurringExpenses.js";

const router = express.Router();

//  Require authentication for all routes
router.use(protect);

/*  CREATE  */
router.post("/", async (req, res) => {
  try {
    const { amount, date, category, description, type, recurrence } = req.body;
    if (amount == null || !date) {
      return res.status(400).json({ message: "amount and date are required" });
    }

    const expense = new Expense({
      user: req.user._id,
      amount: Number(amount),
      date: new Date(date),
      category,
      description,
      type: type || "expense",
      recurrence: recurrence || { enabled: false },
      generatedFromRecurring: null,
    });

    await expense.save();
    return res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error("Create expense error:", err);
    return res.status(500).json({ message: "Server error creating expense" });
  }
});

/* READ (list all user expenses) */
router.get("/", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });
    res.json(expenses || []);
  } catch (err) {
    console.error(" Error fetching expenses:", err);
    res.status(500).json({ message: "Server error fetching expenses" });
  }
});

/* UPDATE */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category, date, description, recurrence } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: id, user: req.user._id },
      {
        $set: {
          ...(amount !== undefined && { amount }),
          ...(category && { category }),
          ...(date && { date }),
          ...(description && { description }),
          ...(recurrence && { recurrence }),
        },
      },
      { new: true }
    );

    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, data: expense });
  } catch (err) {
    console.error(" Update expense error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error updating expense" });
  }
});

/*DELETE */
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Expense.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Expense not found" });
    }

    res.json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error("Delete expense error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error deleting expense" });
  }
});

/*  MANUAL RECURRING TRIGGER (debug) */
router.post("/run-recurring", async (req, res) => {
  try {
    await runRecurringProcessing();
    return res.json({
      success: true,
      message: "Recurring processing executed successfully",
    });
  } catch (err) {
    console.error(" Manual recurring error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Error running recurring processing" });
  }
});

export default router;

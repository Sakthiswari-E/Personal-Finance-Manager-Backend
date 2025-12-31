// backend/routes/goal.js
import express from "express";
import Goal from "../models/Goal.js";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/authMiddleware.js";
import Notification from "../models/Notification.js";

const router = express.Router();

/* =====================================================
   GET — Fetch All Goals (with auto progress calculation)
===================================================== */
router.get("/", protect, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    const results = await Promise.all(
      goals.map(async (goal) => {
        const match = { user: req.user._id };

        if (goal.startDate || goal.endDate) {
          match.date = {};
          if (goal.startDate) match.date.$gte = new Date(goal.startDate);
          if (goal.endDate) match.date.$lte = new Date(goal.endDate);
        }

        if (goal.category) match.category = goal.category;

        const expenses = await Expense.find(match);
        const totalSpent = expenses.reduce(
          (sum, e) => sum + (Number(e.amount) || 0),
          0
        );

        const progressAmount = totalSpent;
        const remaining = Math.max(0, goal.target - progressAmount);
        const progressPercent =
          goal.target > 0
            ? Math.min(100, Math.round((progressAmount / goal.target) * 100))
            : 0;

        if (progressPercent >= 50 && !goal.notified50) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `🎯 Your goal "${goal.name}" is 50% complete! Keep going!`,
          });
          goal.notified50 = true;
          await goal.save();
        }

        if (progressPercent >= 80 && !goal.notified80) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `🔥 Goal "${goal.name}" reached 80% progress! Almost there!`,
          });
          goal.notified80 = true;
          await goal.save();
        }

        if (progressPercent === 100 && !goal.completedNotified) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `✅ Congratulations! Goal "${goal.name}" is fully completed!`,
          });
          goal.completedNotified = true;
          await goal.save();
        }

        return {
          ...goal._doc,
          progressAmount,
          remaining,
          progressPercent,
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Error fetching goals:", err);
    res.status(500).json({ message: "Server error fetching goals" });
  }
});

// router.post("/", protect, async (req, res) => {
//   try {
//     const { name, target, category, startDate, endDate } = req.body;

//     if (!name || !target) {
//       return res
//         .status(400)
//         .json({ message: "Name and target amount are required" });
//     }

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       target,
//       category,
//       startDate,
//       endDate,
//       notified50: false,
//       notified80: false,
//       completedNotified: false,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });
router.post("/", protect, async (req, res) => {
  try {
    const { name, target, saved = 0, category, startDate, endDate } = req.body;

    if (!name || !target) {
      return res.status(400).json({ message: "Name and target are required" });
    }

    const nameNormalized = name.trim().toLowerCase();

    // 🔍 Check existing goal with same name
    let goal = await Goal.findOne({
      user: req.user._id,
      nameNormalized
    });

    if (goal) {
      // ✅ ADD saved amount instead of creating new card
      goal.saved += Number(saved || 0);

      // Optionally update target if changed
      if (target) goal.target = target;

      await goal.save();
      return res.json(goal);
    }

    // 🆕 Create new goal
    goal = await Goal.create({
      user: req.user._id,
      name,
      nameNormalized,
      target,
      saved,
      category,
      startDate,
      endDate,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ Goal create error:", err);
    res.status(500).json({ message: err.message });
  }
});


router.put("/:id", protect, async (req, res) => {
  try {
    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (err) {
    console.error("❌ Error updating goal:", err);
    res.status(500).json({ message: "Server error updating goal" });
  }
});

router.delete("/:id", protect, async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting goal:", err);
    res.status(500).json({ message: "Server error deleting goal" });
  }
});

export default router;

// backend/routes/goals.js
import express from "express";
import Goal from "../models/Goal.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Protect all goal routes (requires valid token)
router.use(protect);

/* GET ALL GOALS */
router.get("/", async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(goals);
  } catch (err) {
    console.error(" Get goals error:", err);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
});

/*CREATE GOAL*/
router.post("/", async (req, res) => {
  try {
    const { title, targetAmount, deadline, currentAmount } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const goal = new Goal({
      user: req.user._id,
      title,
      targetAmount,
      deadline,
      currentAmount: currentAmount || 0,
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    console.error(" Create goal error:", err);
    res.status(500).json({ message: "Server error creating goal" });
  }
});

/*UPDATE GOAL  */
router.put("/:id", async (req, res) => {
  try {
    const { title, targetAmount, deadline, currentAmount } = req.body;

    const updatedGoal = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        title,
        targetAmount,
        deadline,
        currentAmount: currentAmount ?? 0,
      },
      { new: true }
    );

    if (!updatedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updatedGoal);
  } catch (err) {
    console.error("Update goal error:", err);
    res.status(500).json({ message: "Failed to update goal" });
  }
});

/*  DELETE GOAL */
router.delete("/:id", async (req, res) => {
  try {
    const deletedGoal = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deletedGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(" Delete goal error:", err);
    res.status(500).json({ message: "Failed to delete goal" });
  }
});

export default router;

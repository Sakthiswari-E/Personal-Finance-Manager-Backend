// backend/controllers/goalController.js
import Goal from "../models/Goal.js";

//  Create a new goal
export const createGoal = async (req, res) => {
  try {
    const { name, target, saved = 0, category, startDate, endDate } = req.body;

    if (!name || !target) {
      return res.status(400).json({ message: "name and target are required" });
    }

    const goal = await Goal.create({
      name,
      target,
      saved,
      category,
      startDate,
      endDate,
      user: req.user?._id,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ createGoal error:", err);
    res.status(500).json({ message: err.message || "Server error creating goal" });
  }
};

// Get all goals (for the logged-in user)
export const getGoals = async (req, res) => {
  try {
    const filter = process.env.DEV_MODE === "true" ? {} : { user: req.user?._id };
    const goals = await Goal.find(filter).sort({ endDate: 1 });
    res.json(goals);
  } catch (err) {
    console.error("❌ getGoals error:", err);
    res.status(500).json({ message: "Server error fetching goals" });
  }
};

//  Update a goal by ID
export const updateGoal = async (req, res) => {
  try {
    const updated = await Goal.findOneAndUpdate(
      { _id: req.params.id, user: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ updateGoal error:", err);
    res.status(500).json({ message: "Server error updating goal" });
  }
};

// Delete a goal by ID
export const deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user?._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("❌ deleteGoal error:", err);
    res.status(500).json({ message: "Server error deleting goal" });
  }
};

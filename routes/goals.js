// import express from "express";
// import Goal from "../models/Goal.js";

// const router = express.Router();

// /* ===============================
//    GET — All Goals
// =============================== */
// router.get("/", async (req, res) => {
//   try {
//     const goals = await Goal.find().sort({ createdAt: -1 });
//     res.json(goals);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err.message);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* ===============================
//    POST — Create new Goal
// =============================== */
// router.post("/", async (req, res) => {
//   try {
//     const { name, targetAmount, savedAmount, deadline } = req.body;
//     if (!name || !targetAmount)
//       return res.status(400).json({ message: "Name and target amount required" });

//     const goal = await Goal.create({ name, targetAmount, savedAmount, deadline });
//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err.message);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* ===============================
//    PUT — Update Goal
// =============================== */
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) return res.status(404).json({ message: "Goal not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err.message);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// /* ===============================
//    DELETE — Delete Goal
// =============================== */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Goal.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Goal not found" });
//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err.message);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;













// // backend/routes/goalsRoute.js
// import express from "express";
// import Goal from "../models/Goal.js";
// import Expense from "../models/Expense.js";

// const router = express.Router();

// /* ===============================
//    GET — All Goals + Auto Progress
// =============================== */
// router.get("/", async (req, res) => {
//   try {
//     const goals = await Goal.find().sort({ createdAt: -1 });

//     const result = await Promise.all(
//       goals.map(async (goal) => {
//         // Build dynamic match query
//         const match = {};

//         // Optional: filter by date range
//         if (goal.startDate || goal.deadline) {
//           match.date = {};
//           if (goal.startDate) match.date.$gte = new Date(goal.startDate);
//           if (goal.deadline) match.date.$lte = new Date(goal.deadline);
//         }

//         // Optional: match category if goal has one
//         if (goal.category) match.category = goal.category;

//         // Fetch all relevant expenses
//         const expenses = await Expense.find(match);

//         // Sum all expenses in range
//         const totalSpent = expenses.reduce(
//           (sum, e) => sum + (Number(e.amount) || 0),
//           0
//         );

//         // Compute metrics
//         const progressAmount = totalSpent;
//         const remaining = Math.max(0, goal.targetAmount - progressAmount);
//         const progressPercent =
//           goal.targetAmount > 0
//             ? Math.min(100, Math.round((progressAmount / goal.targetAmount) * 100))
//             : 0;

//         return {
//           ...goal._doc,
//           progressAmount,
//           remaining,
//           progressPercent,
//         };
//       })
//     );

//     res.json(result);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* ===============================
//    POST — Create Goal
// =============================== */
// router.post("/", async (req, res) => {
//   try {
//     const { name, targetAmount, startDate, deadline, category } = req.body;
//     if (!name || !targetAmount) {
//       return res.status(400).json({ message: "Name and target amount required" });
//     }

//     const goal = await Goal.create({
//       name,
//       targetAmount,
//       startDate,
//       deadline,
//       category,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* ===============================
//    PUT — Update Goal
// =============================== */
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) return res.status(404).json({ message: "Goal not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// /* ===============================
//    DELETE — Delete Goal
// =============================== */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Goal.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Goal not found" });
//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;





// // backend/routes/goals.js
// import express from "express";
// import Goal from "../models/Goal.js";

// const router = express.Router();

// // Create goal
// router.post("/", async (req, res) => {
//   try {
//     const goal = await Goal.create(req.body);
//     res.status(201).json(goal);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Get all goals
// router.get("/", async (req, res) => {
//   const goals = await Goal.find();
//   res.json(goals);
// });

// // Update progress
// router.put("/:id", async (req, res) => {
//   try {
//     const goal = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(goal);
//   } catch (err) {
//     res.status(400).json({ error: err.message });
//   }
// });

// // Delete goal
// router.delete("/:id", async (req, res) => {
//   await Goal.findByIdAndDelete(req.params.id);
//   res.json({ message: "Goal deleted" });
// });

// export default router;













// // backend/routes/goalsRoute.js
// import express from "express";
// import Goal from "../models/Goal.js";
// import Expense from "../models/Expense.js";

// const router = express.Router();

// /* ===============================
//    GET — All Goals + Auto Progress
// =============================== */
// router.get("/", async (req, res) => {
//   try {
//     const goals = await Goal.find().sort({ createdAt: -1 });

//     const result = await Promise.all(
//       goals.map(async (goal) => {
//         const match = {};

//         // Optional: filter by date range
//         if (goal.startDate || goal.deadline) {
//           match.date = {};
//           if (goal.startDate) match.date.$gte = new Date(goal.startDate);
//           if (goal.deadline) match.date.$lte = new Date(goal.deadline);
//         }

//         // Optional: match category if goal has one
//         if (goal.category) match.category = goal.category;

//         // Fetch all relevant expenses
//         const expenses = await Expense.find(match);

//         // Sum all expenses in range
//         const totalSpent = expenses.reduce(
//           (sum, e) => sum + (Number(e.amount) || 0),
//           0
//         );

//         // Compute metrics
//         const progressAmount = totalSpent;
//         const remaining = Math.max(0, goal.targetAmount - progressAmount);
//         const progressPercent =
//           goal.targetAmount > 0
//             ? Math.min(100, Math.round((progressAmount / goal.targetAmount) * 100))
//             : 0;

//         return {
//           ...goal._doc,
//           progressAmount,
//           remaining,
//           progressPercent,
//         };
//       })
//     );

//     res.json(result);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* ===============================
//    POST — Create Goal
// =============================== */
// router.post("/", async (req, res) => {
//   try {
//     const { name, targetAmount, startDate, deadline, category } = req.body;
//     if (!name || !targetAmount) {
//       return res.status(400).json({ message: "Name and target amount required" });
//     }

//     const goal = await Goal.create({
//       name,
//       targetAmount,
//       startDate,
//       deadline,
//       category,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* ===============================
//    PUT — Update Goal
// =============================== */
// router.put("/:id", async (req, res) => {
//   try {
//     const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     if (!updated) return res.status(404).json({ message: "Goal not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// /* ===============================
//    DELETE — Delete Goal
// =============================== */
// router.delete("/:id", async (req, res) => {
//   try {
//     const deleted = await Goal.findByIdAndDelete(req.params.id);
//     if (!deleted) return res.status(404).json({ message: "Goal not found" });
//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;













// // backend/routes/goalsRoute.js
// import express from "express";
// import Goal from "../models/Goal.js";
// import Expense from "../models/Expense.js";
// import { protect } from "../middleware/authMiddleware.js"; // ✅ added

// const router = express.Router();

// /* ===============================
//    GET — All Goals + Auto Progress
// =============================== */
// router.get("/", protect, async (req, res) => {
//   try {
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     const result = await Promise.all(
//       goals.map(async (goal) => {
//         const match = { user: req.user._id };

//         if (goal.startDate || goal.deadline) {
//           match.date = {};
//           if (goal.startDate) match.date.$gte = new Date(goal.startDate);
//           if (goal.deadline) match.date.$lte = new Date(goal.deadline);
//         }

//         if (goal.category) match.category = goal.category;

//         const expenses = await Expense.find(match);
//         const totalSpent = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

//         const progressAmount = totalSpent;
//         const remaining = Math.max(0, goal.targetAmount - progressAmount);
//         const progressPercent =
//           goal.targetAmount > 0
//             ? Math.min(100, Math.round((progressAmount / goal.targetAmount) * 100))
//             : 0;

//         return {
//           ...goal._doc,
//           progressAmount,
//           remaining,
//           progressPercent,
//         };
//       })
//     );

//     res.json(result);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* ===============================
//    POST — Create Goal
// =============================== */
// router.post("/", protect, async (req, res) => {
//   try {
//     const { name, targetAmount, startDate, deadline, category } = req.body;
//     if (!name || !targetAmount) {
//       return res.status(400).json({ message: "Name and target amount required" });
//     }

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       targetAmount,
//       startDate,
//       deadline,
//       category,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* ===============================
//    PUT — Update Goal
// =============================== */
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const updated = await Goal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updated) return res.status(404).json({ message: "Goal not found" });
//     res.json(updated);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// /* ===============================
//    DELETE — Delete Goal
// =============================== */
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const deleted = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });
//     if (!deleted) return res.status(404).json({ message: "Goal not found" });
//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;



// // backend/routes/goalRoutes.js
// import express from "express";
// import { createGoal, getGoals, updateGoal, deleteGoal } from "../controllers/goalController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.route("/")
//   .get(protect, getGoals)
//   .post(protect, createGoal);

// router.route("/:id")
//   .put(protect, updateGoal)
//   .delete(protect, deleteGoal);

// export default router;












// // backend/routes/goalRoutes.js
// import express from "express";
// import Goal from "../models/Goal.js";
// import Expense from "../models/Expense.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// /* =====================================================
//    GET — Fetch All Goals (with auto progress calculation)
// ===================================================== */
// router.get("/", protect, async (req, res) => {
//   try {
//     // Fetch all user goals (sorted by newest first)
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     // For each goal, calculate total spent from expenses
//     const results = await Promise.all(
//       goals.map(async (goal) => {
//         const match = { user: req.user._id };

//         // Filter expenses by goal date range (if defined)
//         if (goal.startDate || goal.endDate) {
//           match.date = {};
//           if (goal.startDate) match.date.$gte = new Date(goal.startDate);
//           if (goal.endDate) match.date.$lte = new Date(goal.endDate);
//         }

//         // Match category if goal has one
//         if (goal.category) match.category = goal.category;

//         // Sum up total expenses in that range/category
//         const expenses = await Expense.find(match);
//         const totalSpent = expenses.reduce(
//           (sum, e) => sum + (Number(e.amount) || 0),
//           0
//         );

//         // Calculate progress
//         const progressAmount = totalSpent;
//         const remaining = Math.max(0, goal.target - progressAmount);
//         const progressPercent =
//           goal.target > 0
//             ? Math.min(100, Math.round((progressAmount / goal.target) * 100))
//             : 0;

//         // Return enriched goal
//         return {
//           ...goal._doc,
//           progressAmount,
//           remaining,
//           progressPercent,
//         };
//       })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* =====================================================
//    POST — Create New Goal
// ===================================================== */
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
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* =====================================================
//    PUT — Update Goal by ID
// ===================================================== */
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const updatedGoal = await Goal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedGoal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json(updatedGoal);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// /* =====================================================
//    DELETE — Remove Goal by ID
// ===================================================== */
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const deletedGoal = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!deletedGoal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;












// // backend/routes/goal.js
// import express from "express";
// import Goal from "../models/Goal.js";
// import Expense from "../models/Expense.js";
// import { protect } from "../middleware/authMiddleware.js";
// import Notification from "../models/Notification.js";

// const router = express.Router();

// /* =====================================================
//    GET — Fetch All Goals (with auto progress calculation)
// ===================================================== */
// router.get("/", protect, async (req, res) => {
//   try {
//     // Fetch all user goals (sorted by newest first)
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     // For each goal, calculate total spent from expenses
//     const results = await Promise.all(
//       goals.map(async (goal) => {
//         const match = { user: req.user._id };

//         // Filter expenses by goal date range (if defined)
//         if (goal.startDate || goal.endDate) {
//           match.date = {};
//           if (goal.startDate) match.date.$gte = new Date(goal.startDate);
//           if (goal.endDate) match.date.$lte = new Date(goal.endDate);
//         }

//         // Match category if goal has one
//         if (goal.category) match.category = goal.category;

//         // Sum up total expenses in that range/category
//         const expenses = await Expense.find(match);
//         const totalSpent = expenses.reduce(
//           (sum, e) => sum + (Number(e.amount) || 0),
//           0
//         );

//         // Calculate progress
//         const progressAmount = totalSpent;
//         const remaining = Math.max(0, goal.target - progressAmount);
//         const progressPercent =
//           goal.target > 0
//             ? Math.min(100, Math.round((progressAmount / goal.target) * 100))
//             : 0;

//         // Return enriched goal
//         return {
//           ...goal._doc,
//           progressAmount,
//           remaining,
//           progressPercent,
//         };
//       })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("❌ Error fetching goals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// });

// /* =====================================================
//    POST — Create New Goal
// ===================================================== */
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
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ Error creating goal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// });

// /* =====================================================
//    PUT — Update Goal by ID
// ===================================================== */
// router.put("/:id", protect, async (req, res) => {
//   try {
//     const updatedGoal = await Goal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updatedGoal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json(updatedGoal);
//   } catch (err) {
//     console.error("❌ Error updating goal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// });

// // if (goal.savedAmount >= goal.targetAmount * 0.5) {
// //   await Notification.create({
// //     userId: req.user._id,
// //     type: "goal",
// //     message: `🎯 Goal "${goal.title}" is 50% complete!`
// //   });
// // }

// /* =====================================================
//    DELETE — Remove Goal by ID
// ===================================================== */
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const deletedGoal = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!deletedGoal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ Error deleting goal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// });

// export default router;




















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

        //  AUTO NOTIFICATION ON GOAL PROGRESS
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

router.post("/", protect, async (req, res) => {
  try {
    const { name, target, category, startDate, endDate } = req.body;

    if (!name || !target) {
      return res
        .status(400)
        .json({ message: "Name and target amount are required" });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      target,
      category,
      startDate,
      endDate,
      notified50: false,
      notified80: false,
      completedNotified: false,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ Error creating goal:", err);
    res.status(500).json({ message: "Server error creating goal" });
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

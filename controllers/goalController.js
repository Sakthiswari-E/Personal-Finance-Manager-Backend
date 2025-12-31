// // backend/controllers/goalController.js
// import Goal from "../models/Goal.js";

// //  Create a new goal
// export const createGoal = async (req, res) => {
//   try {
//     const { name, target, saved = 0, category, startDate, endDate } = req.body;

//     if (!name || !target) {
//       return res.status(400).json({ message: "name and target are required" });
//     }

//     const goal = await Goal.create({
//       name,
//       target,
//       saved,
//       category,
//       startDate,
//       endDate,
//       user: req.user?._id,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ createGoal error:", err);
//     res.status(500).json({ message: err.message || "Server error creating goal" });
//   }
// };

// // Get all goals (for the logged-in user)
// export const getGoals = async (req, res) => {
//   try {
//     const filter = process.env.DEV_MODE === "true" ? {} : { user: req.user?._id };
//     const goals = await Goal.find(filter).sort({ endDate: 1 });
//     res.json(goals);
//   } catch (err) {
//     console.error("❌ getGoals error:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// };

// //  Update a goal by ID
// export const updateGoal = async (req, res) => {
//   try {
//     const updated = await Goal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user?._id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json(updated);
//   } catch (err) {
//     console.error("❌ updateGoal error:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// };

// // Delete a goal by ID
// export const deleteGoal = async (req, res) => {
//   try {
//     const deleted = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user?._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ deleteGoal error:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// };









// import Goal from "../models/Goal.js";
// import Notification from "../models/Notification.js";

// /* ===============================
//    CREATE OR INCREMENT GOAL
// ================================ */
// export const createGoal = async (req, res) => {
//   try {
//     const { name, target, saved = 0, category, startDate, endDate } = req.body;

//     if (!name || !target) {
//       return res.status(400).json({ message: "Name and target are required" });
//     }

//     // 🔍 Check existing goal (same name + user)
//     const existing = await Goal.findOne({
//       user: req.user._id,
//       name: { $regex: new RegExp(`^${name}$`, "i") },
//     });

//     if (existing) {
//       existing.saved += Number(saved || 0);
//       await existing.save();
//       return res.json(existing);
//     }

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       target,
//       saved,
//       category,
//       startDate,
//       endDate,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ createGoal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// };

// /* ===============================
//    GET GOALS WITH PROGRESS
// ================================ */
// export const getGoals = async (req, res) => {
//   try {
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     const results = await Promise.all(
//       goals.map(async (goal) => {
//         const progressPercent =
//           goal.target > 0
//             ? Math.min(100, Math.round((goal.saved / goal.target) * 100))
//             : 0;

//         // 🔔 Notifications
//         if (progressPercent >= 50 && !goal.notified50) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🎯 Your goal "${goal.name}" reached 50%!`,
//           });
//           goal.notified50 = true;
//         }

//         if (progressPercent >= 80 && !goal.notified80) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🔥 "${goal.name}" is 80% complete!`,
//           });
//           goal.notified80 = true;
//         }

//         if (progressPercent === 100 && !goal.completedNotified) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `✅ Goal "${goal.name}" completed!`,
//           });
//           goal.completedNotified = true;
//         }

//         await goal.save();

//         return {
//           ...goal._doc,
//           progressPercent,
//           remaining: Math.max(0, goal.target - goal.saved),
//         };
//       })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("❌ getGoals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// };

// /* ===============================
//    UPDATE GOAL
// ================================ */
// export const updateGoal = async (req, res) => {
//   try {
//     const updated = await Goal.findOneAndUpdate(
//       { _id: req.params.id, user: req.user._id },
//       req.body,
//       { new: true, runValidators: true }
//     );

//     if (!updated) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json(updated);
//   } catch (err) {
//     console.error("❌ updateGoal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// };

// /* ===============================
//    DELETE GOAL
// ================================ */
// export const deleteGoal = async (req, res) => {
//   try {
//     const deleted = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ deleteGoal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// };











// //Backend\controllers\goalController.js
// import Goal from "../models/Goal.js";
// import Notification from "../models/Notification.js";

// /* ===============================
//    CREATE OR ADD SAVINGS TO GOAL
// ================================ */
// export const createGoal = async (req, res) => {
//   try {
//     let { name, target, saved = 0, category, startDate, endDate } = req.body;

//     if (!name || !target) {
//       return res.status(400).json({ message: "Name and target are required" });
//     }

//     // 🔒 Normalize name
//     const normalizedName = name.trim().toLowerCase();

//     const existingGoal = await Goal.findOne({
//       user: req.user._id,
//       nameNormalized: normalizedName,
//     });

//     if (existingGoal) {
//       // ✅ ADD savings (not overwrite)
//       existingGoal.saved += Number(saved || 0);
//       await existingGoal.save();
//       return res.json(existingGoal);
//     }

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       nameNormalized: normalizedName,
//       target,
//       saved,
//       category,
//       startDate,
//       endDate,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ createGoal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// };

// /* ===============================
//    GET GOALS
// ================================ */
// export const getGoals = async (req, res) => {
//   try {
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     const results = await Promise.all(
//       goals.map(async (goal) => {
//         const progressPercent =
//           goal.target > 0
//             ? Math.min(100, Math.round((goal.saved / goal.target) * 100))
//             : 0;

//         // 🔔 Notifications
//         if (progressPercent >= 50 && !goal.notified50) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🎯 Your goal "${goal.name}" reached 50%!`,
//           });
//           goal.notified50 = true;
//         }

//         if (progressPercent >= 80 && !goal.notified80) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🔥 "${goal.name}" is 80% complete!`,
//           });
//           goal.notified80 = true;
//         }

//         if (progressPercent === 100 && !goal.completedNotified) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `✅ Goal "${goal.name}" completed!`,
//           });
//           goal.completedNotified = true;
//         }

//         await goal.save();

//         return {
//           ...goal._doc,
//           progressPercent,
//           remaining: Math.max(0, goal.target - goal.saved),
//         };
//       })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("❌ getGoals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// };

// export const addGoal = async (req, res) => {
//   try {
//     const { name, target, endDate, category } = req.body;

//     if (!name || !target) {
//       return res.status(400).json({
//         message: "Name and target are required",
//       });
//     }

//     const nameNormalized = name.toLowerCase().trim();

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       nameNormalized,
//       target,
//       category,
//       endDate,
//     });

//     res.status(201).json(goal);
//   } catch (error) {
//     console.error("Create Goal Error:", error);
//     res.status(500).json({
//       message: "Server error creating goal",
//     });
//   }
// };

// /* ===============================
//    UPDATE GOAL (SAFE)
// ================================ */
// export const updateGoal = async (req, res) => {
//   try {
//     const goal = await Goal.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!goal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     // 🔐 SAFE UPDATES
//     if (req.body.name) {
//       goal.name = req.body.name;
//       goal.nameNormalized = req.body.name.trim().toLowerCase();
//     }

//     if (req.body.target !== undefined) {
//       goal.target = Number(req.body.target);
//     }

//     // ❗ Important: saved is UPDATED ONLY if number is sent
//     if (req.body.saved !== undefined && req.body.saved !== "") {
//       goal.saved = Number(req.body.saved);
//     }

//     if (req.body.category !== undefined) goal.category = req.body.category;
//     if (req.body.startDate !== undefined) goal.startDate = req.body.startDate;
//     if (req.body.endDate !== undefined) goal.endDate = req.body.endDate;

//     await goal.save();

//     res.json(goal);
//   } catch (err) {
//     console.error("❌ updateGoal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// };

// /* ===============================
//    DELETE GOAL
// ================================ */
// export const deleteGoal = async (req, res) => {
//   try {
//     const deleted = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ deleteGoal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// };









// //Backend\controllers\goalController.js
// import Goal from "../models/Goal.js";
// import Notification from "../models/Notification.js";

// /* ===============================
//    CREATE GOAL (NO AUTO ADD)
// ================================ */
// export const createGoal = async (req, res) => {
//   try {
//     const { name, target, category, endDate } = req.body;

//     if (!name || !target) {
//       return res.status(400).json({ message: "Name and target are required" });
//     }

//     const nameNormalized = name.trim().toLowerCase();

//     const exists = await Goal.findOne({
//       user: req.user._id,
//       nameNormalized,
//     });

//     if (exists) {
//       return res.status(400).json({ message: "Goal already exists" });
//     }

//     const goal = await Goal.create({
//       user: req.user._id,
//       name,
//       nameNormalized,
//       target,
//       category,
//       endDate,
//       saved: 0,
//     });

//     res.status(201).json(goal);
//   } catch (err) {
//     console.error("❌ createGoal:", err);
//     res.status(500).json({ message: "Server error creating goal" });
//   }
// };

// /* ===============================
//    GET GOALS
// ================================ */
// export const getGoals = async (req, res) => {
//   try {
//     const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

//     const results = await Promise.all(
//       goals.map(async (goal) => {
//         const percent =
//           goal.target > 0
//             ? Math.min(100, Math.round((goal.saved / goal.target) * 100))
//             : 0;

//         if (percent >= 50 && !goal.notified50) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🎯 "${goal.name}" reached 50%`,
//           });
//           goal.notified50 = true;
//         }

//         if (percent >= 80 && !goal.notified80) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `🔥 "${goal.name}" reached 80%`,
//           });
//           goal.notified80 = true;
//         }

//         if (percent === 100 && !goal.completedNotified) {
//           await Notification.create({
//             userId: req.user._id,
//             type: "goal",
//             message: `✅ "${goal.name}" completed!`,
//           });
//           goal.completedNotified = true;
//         }

//         await goal.save();

//         return {
//           ...goal._doc,
//           progressPercent: percent,
//           remaining: Math.max(0, goal.target - goal.saved),
//         };
//       })
//     );

//     res.json(results);
//   } catch (err) {
//     console.error("❌ getGoals:", err);
//     res.status(500).json({ message: "Server error fetching goals" });
//   }
// };

// /* ===============================
//    ADD SAVINGS
// ================================ */
// export const addSavings = async (req, res) => {
//   try {
//     const { amount } = req.body;

//     if (!amount || amount <= 0) {
//       return res.status(400).json({ message: "Valid amount required" });
//     }

//     const goal = await Goal.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!goal) return res.status(404).json({ message: "Goal not found" });

//     goal.saved += Number(amount);
//     await goal.save();

//     res.json(goal);
//   } catch (err) {
//     console.error("❌ addSavings:", err);
//     res.status(500).json({ message: "Server error adding savings" });
//   }
// };

// /* ===============================
//    UPDATE GOAL (SAFE)
// ================================ */
// export const updateGoal = async (req, res) => {
//   try {
//     const goal = await Goal.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!goal) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     // 🔐 SAFE UPDATES
//     if (req.body.name) {
//       goal.name = req.body.name;
//       goal.nameNormalized = req.body.name.trim().toLowerCase();
//     }

//     if (req.body.target !== undefined) {
//       goal.target = Number(req.body.target);
//     }

//     // ❗ Important: saved is UPDATED ONLY if number is sent
//     if (req.body.saved !== undefined && req.body.saved !== "") {
//       goal.saved = Number(req.body.saved);
//     }

//     if (req.body.category !== undefined) goal.category = req.body.category;
//     if (req.body.startDate !== undefined) goal.startDate = req.body.startDate;
//     if (req.body.endDate !== undefined) goal.endDate = req.body.endDate;

//     await goal.save();

//     res.json(goal);
//   } catch (err) {
//     console.error("❌ updateGoal:", err);
//     res.status(500).json({ message: "Server error updating goal" });
//   }
// };

// /* ===============================
//    DELETE GOAL
// ================================ */
// export const deleteGoal = async (req, res) => {
//   try {
//     const deleted = await Goal.findOneAndDelete({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!deleted) {
//       return res.status(404).json({ message: "Goal not found" });
//     }

//     res.json({ message: "Goal deleted successfully" });
//   } catch (err) {
//     console.error("❌ deleteGoal:", err);
//     res.status(500).json({ message: "Server error deleting goal" });
//   }
// };



//Backend\controllers\goalController.js
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";

/* ===============================
   CREATE GOAL
================================ */
export const createGoal = async (req, res) => {
  try {
    console.log("USER:", req.user); 
    const { name, target, category, startDate, endDate } = req.body;

    if (!name || !target) {
      return res.status(400).json({ message: "Name and target are required" });
    }

    const nameNormalized = name.trim().toLowerCase();

    const exists = await Goal.findOne({
      user: req.user._id,
      nameNormalized,
    });

    if (exists) {
      return res.status(400).json({ message: "Goal already exists" });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name,
      nameNormalized,
      target,
      saved: 0,
      category,
      startDate,
      endDate,
    });

    res.status(201).json(goal);
  } catch (err) {
    console.error("❌ createGoal:", err);
    res.status(500).json({ message: "Server error creating goal" });
  }
};

/* ===============================
   GET GOALS + PROGRESS
================================ */
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });

    const results = await Promise.all(
      goals.map(async (goal) => {
        const percent =
          goal.target > 0
            ? Math.min(100, Math.round((goal.saved / goal.target) * 100))
            : 0;

        // Notifications
        if (percent >= 50 && !goal.notified50) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `🎯 "${goal.name}" reached 50%`,
          });
          goal.notified50 = true;
        }

        if (percent >= 80 && !goal.notified80) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `🔥 "${goal.name}" reached 80%`,
          });
          goal.notified80 = true;
        }

        if (percent === 100 && !goal.completedNotified) {
          await Notification.create({
            userId: req.user._id,
            type: "goal",
            message: `✅ "${goal.name}" completed!`,
          });
          goal.completedNotified = true;
        }

        await goal.save();

        return {
          ...goal._doc,
          progressPercent: percent,
          remaining: Math.max(0, goal.target - goal.saved),
        };
      })
    );

    res.json(results);
  } catch (err) {
    console.error("❌ getGoals:", err);
    res.status(500).json({ message: "Server error fetching goals" });
  }
};

/* ===============================
   ADD SAVINGS
================================ */
export const addSavings = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Valid amount required" });
    }

    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    goal.saved += Number(amount);
    await goal.save();

    res.json(goal);
  } catch (err) {
    console.error("❌ addSavings:", err);
    res.status(500).json({ message: "Server error adding savings" });
  }
};

/* ===============================
   UPDATE GOAL
================================ */
export const updateGoal = async (req, res) => {
  try {
    const goal = await Goal.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    if (req.body.name) {
      goal.name = req.body.name;
      goal.nameNormalized = req.body.name.trim().toLowerCase();
    }

    if (req.body.target !== undefined) goal.target = Number(req.body.target);
    if (req.body.saved !== undefined) goal.saved = Number(req.body.saved);
    if (req.body.category !== undefined) goal.category = req.body.category;
    if (req.body.startDate !== undefined) goal.startDate = req.body.startDate;
    if (req.body.endDate !== undefined) goal.endDate = req.body.endDate;

    await goal.save();
    res.json(goal);
  } catch (err) {
    console.error("❌ updateGoal:", err);
    res.status(500).json({ message: "Server error updating goal" });
  }
};

/* ===============================
   DELETE GOAL
================================ */
export const deleteGoal = async (req, res) => {
  try {
    const deleted = await Goal.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Goal not found" });
    }

    res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    console.error("❌ deleteGoal:", err);
    res.status(500).json({ message: "Server error deleting goal" });
  }
};

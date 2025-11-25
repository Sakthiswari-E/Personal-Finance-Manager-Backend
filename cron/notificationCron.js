// import cron from "node-cron";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import RecurringBill from "../models/RecurringBill.js";
// import Goal from "../models/Goal.js";
// import { createNotification } from "../utils/notify.js";

// cron.schedule("* * * * *", async () => {
//   console.log("⏰ Notification Cron Running...");

//   try {
//     /* ---------- Budget Alerts ---------- */
//     const budgets = await Budget.find();

//     for (const budget of budgets) {
// const total = await Expense.aggregate([
//   { 
//     $match: { 
//       userId: budget.userId,   // FIXED FIELD
//       category: budget.category 
//     } 
//   },
//   { $group: { _id: null, total: { $sum: "$amount" } } },
// ]);


//       const spent = total[0]?.total || 0;
//       const percent = (spent / budget.limit) * 100;

//       if (percent >= 100) {
//         await createNotification(
//           budget.user,
//           "budget",
//           `⚠️ You exceeded your budget for ${budget.category}!`
//         );
//       } else if (percent >= 80) {
//         await createNotification(
//           budget.user,
//           "budget",
//           `⚠️ You have used 80% of your ${budget.category} budget.`
//         );
//       }
//     }

//     /* ---------- Bill Due Today ---------- */
//     const today = new Date().toISOString().split("T")[0];
//     const dueBills = await RecurringBill.find({ nextDueDate: today });

//     for (const bill of dueBills) {
//       await createNotification(
//         bill.user,
//         "bill",
//         `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
//       );

//       // Move nextDueDate by 1 month
//       const next = new Date(bill.nextDueDate);
//       next.setMonth(next.getMonth() + 1);

//       bill.nextDueDate = next;
//       await bill.save();
//     }

//     /* ---------- Goal Progress ---------- */
//     const goals = await Goal.find();

//     for (const goal of goals) {
//       const percent = (goal.saved / goal.target) * 100;

//       if (percent >= 100) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🎯 Goal Achieved! You reached: ${goal.name}`
//         );
//       } else if (percent >= 80) {
//         await createNotification(
//           goal.user,
//           "goal",
//           `🔥 You reached 80% of your goal: ${goal.name}`
//         );
//       }
//     }

//     console.log("✅ Notification Cron Finished!");
//   } catch (error) {
//     console.error("❌ Cron Error:", error);
//   }
// });












import cron from "node-cron";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import RecurringBill from "../models/RecurringBill.js";
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";   // REQUIRED
import { createNotification } from "../utils/notify.js";

// Runs every day at 9 AM
cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Notification Cron Running...");

  try {
    /* -----------------------------------------------------
     *                 B U D G E T   A L E R T S
     * ----------------------------------------------------- */
    const budgets = await Budget.find();

    for (const budget of budgets) {
      // FIX: Your expense schema uses userId (not user)
      const total = await Expense.aggregate([
        {
          $match: {
            userId: budget.userId,     // FIXED
            category: budget.category
          }
        },
        {
          $group: { _id: null, total: { $sum: "$amount" } }
        }
      ]);

      const spent = total[0]?.total || 0;

      // FIX: Budget limit field (your model uses "limit")
      const percent = (spent / budget.limit) * 100;

      /* ---- Prevent Duplicates ---- */
      const exceededMsg = `⚠️ You exceeded your budget for ${budget.category}!`;
      const eightyMsg = `⚠️ You have used 80% of your ${budget.category} budget.`;

      if (percent >= 100) {
        const exists = await Notification.findOne({
          userId: budget.userId,
          type: "budget",
          message: exceededMsg
        });

        if (!exists) {
          await createNotification(budget.userId, "budget", exceededMsg);
        }

      } else if (percent >= 80) {
        const exists = await Notification.findOne({
          userId: budget.userId,
          type: "budget",
          message: eightyMsg
        });

        if (!exists) {
          await createNotification(budget.userId, "budget", eightyMsg);
        }
      }
    }

    /* -----------------------------------------------------
     *                  B I L L   D U E
     * ----------------------------------------------------- */
    const today = new Date().toISOString().split("T")[0];
    const dueBills = await RecurringBill.find({ nextDueDate: today });

    for (const bill of dueBills) {
      await createNotification(
        bill.user,
        "bill",
        `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
      );

      // Move next due date 1 month ahead
      const next = new Date(bill.nextDueDate);
      next.setMonth(next.getMonth() + 1);
      bill.nextDueDate = next;
      await bill.save();
    }

    /* -----------------------------------------------------
     *                G O A L   P R O G R E S S
     * ----------------------------------------------------- */
    const goals = await Goal.find();

    for (const goal of goals) {
      const percent = (goal.saved / goal.target) * 100;

      const eightyGoalMsg = `🔥 You reached 80% of your goal: ${goal.name}`;
      const doneGoalMsg = `🎯 Goal Achieved! You reached: ${goal.name}`;

      if (percent >= 100) {
        const exists = await Notification.findOne({
          userId: goal.user,
          type: "goal",
          message: doneGoalMsg
        });

        if (!exists) {
          await createNotification(goal.user, "goal", doneGoalMsg);
        }

      } else if (percent >= 80) {
        const exists = await Notification.findOne({
          userId: goal.user,
          type: "goal",
          message: eightyGoalMsg
        });

        if (!exists) {
          await createNotification(goal.user, "goal", eightyGoalMsg);
        }
      }
    }

    console.log("✅ Notification Cron Finished Successfully!");
  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});

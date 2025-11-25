// import cron from "node-cron";
// import Budget from "../models/Budget.js";
// import Expense from "../models/Expense.js";
// import RecurringBill from "../models/RecurringBill.js";
// import Goal from "../models/Goal.js";
// import { createNotification } from "../utils/notify.js";

// // Runs every day at 9AM
// cron.schedule("0 9 * * *", async () => {
//   console.log("⏰ Notification Cron Running...");

//   try {
//     // ----------- Budget Limit Notifications -----------
//     const budgets = await Budget.find();
//     for (const budget of budgets) {
//       const totalSpent = await Expense.aggregate([
//         { $match: { user: budget.user, category: budget.category } },
//         { $group: { _id: null, total: { $sum: "$amount" } } }
//       ]);

//       const spent = totalSpent[0]?.total || 0;
//       const percentUsed = (spent / budget.limit) * 100;

//       if (percentUsed >= 100) {
//         await createNotification(budget.user, "budget", `⚠️ You exceeded your budget for ${budget.category}!`);
//       } else if (percentUsed >= 80) {
//         await createNotification(budget.user, "budget", `⚠️ You have used 80% of your ${budget.category} budget.`);
//       }
//     }

//     // -----------  Bill Due Today Notifications -----------
//     const today = new Date().toISOString().split("T")[0];
//     const dueBills = await RecurringBill.find({ nextDueDate: today });

//     for (const bill of dueBills) {
//       await createNotification(bill.user, "bill", `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`);
//     }

//     // -----------  Goal Progress Notifications -----------
//     const goals = await Goal.find();
//     for (const goal of goals) {
//       const percentSaved = (goal.saved / goal.target) * 100;
//       if (percentSaved >= 100) {
//         await createNotification(goal.user, "goal", `🎯 Congratulations! You achieved your goal: ${goal.name}`);
//       } else if (percentSaved >= 80) {
//         await createNotification(goal.user, "goal", `🔥 You are 80% close to your goal: ${goal.name}`);
//       }
//     }

//     console.log("✅ Notification Cron Finished!");

//   } catch (error) {
//     console.error("❌ Error in Notification Cron:", error);
//   }
// });











import cron from "node-cron";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import RecurringBill from "../models/RecurringBill.js";
import Goal from "../models/Goal.js";
import { createNotification } from "../utils/notify.js";

cron.schedule("0 9 * * *", async () => {
  console.log("⏰ Notification Cron Running...");

  try {
    /* ---------- Budget Alerts ---------- */
    const budgets = await Budget.find();

    for (const budget of budgets) {
      const total = await Expense.aggregate([
        { $match: { user: budget.user, category: budget.category } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = total[0]?.total || 0;
      const percent = (spent / budget.limit) * 100;

      if (percent >= 100) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You exceeded your budget for ${budget.category}!`
        );
      } else if (percent >= 80) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You have used 80% of your ${budget.category} budget.`
        );
      }
    }

    /* ---------- Bill Due Today ---------- */
    const today = new Date().toISOString().split("T")[0];
    const dueBills = await RecurringBill.find({ nextDueDate: today });

    for (const bill of dueBills) {
      await createNotification(
        bill.user,
        "bill",
        `📅 Your ${bill.name} bill of ₹${bill.amount} is due today.`
      );

      // Move nextDueDate by 1 month
      const next = new Date(bill.nextDueDate);
      next.setMonth(next.getMonth() + 1);

      bill.nextDueDate = next;
      await bill.save();
    }

    /* ---------- Goal Progress ---------- */
    const goals = await Goal.find();

    for (const goal of goals) {
      const percent = (goal.saved / goal.target) * 100;

      if (percent >= 100) {
        await createNotification(
          goal.user,
          "goal",
          `🎯 Goal Achieved! You reached: ${goal.name}`
        );
      } else if (percent >= 80) {
        await createNotification(
          goal.user,
          "goal",
          `🔥 You reached 80% of your goal: ${goal.name}`
        );
      }
    }

    console.log("✅ Notification Cron Finished!");
  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});

// cron/notificationsCron.js
import cron from "node-cron";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import Goal from "../models/Goal.js";
import Notification from "../models/Notification.js";
import { createNotification } from "../utils/notify.js";

cron.schedule("* * * * *", async () => {
  console.log("⏰ Notification Cron Running...");

  try {
    /* --------------------------------------------------
       BUDGET ALERTS (ONE-TIME ONLY)
    -------------------------------------------------- */
    const budgets = await Budget.find();

    for (const budget of budgets) {
      if (!budget.notificationFlags) {
        budget.notificationFlags = { budget80: false, budget100: false };
      }

      const total = await Expense.aggregate([
        { $match: { userId: budget.user, category: budget.category } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      const spent = total[0]?.total || 0;
      const percent = (spent / budget.amount) * 100;

      // 100% alert
      if (percent >= 100 && !budget.notificationFlags.budget100) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You exceeded your budget for ${budget.category}!`
        );

        budget.notificationFlags.budget100 = true;
        budget.notificationFlags.budget80 = true; // prevent 80% later
        await budget.save();
      }

      // 80% alert
      else if (percent >= 80 && !budget.notificationFlags.budget80) {
        await createNotification(
          budget.user,
          "budget",
          `⚠️ You have used 80% of your ${budget.category} budget.`
        );

        budget.notificationFlags.budget80 = true;
        await budget.save();
      }
    }

    /* --------------------------------------------------
       GOAL ALERTS (ONE-TIME ONLY)
    -------------------------------------------------- */
    const goals = await Goal.find();

    for (const goal of goals) {
      if (!goal.notificationFlags) {
        goal.notificationFlags = {
          goal50: false,
          goal80: false,
          goal100: false,
        };
      }

      const percent = (goal.saved / goal.target) * 100;

      // 100% alert
      if (percent >= 100 && !goal.notificationFlags.goal100) {
        await createNotification(
          goal.user,
          "goal",
          `🎯 Goal Achieved! You reached: ${goal.name}`
        );

        goal.notificationFlags.goal100 = true;
        goal.notificationFlags.goal80 = true;
        goal.notificationFlags.goal50 = true;
        await goal.save();
      }

      // 80% alert
      else if (percent >= 80 && !goal.notificationFlags.goal80) {
        await createNotification(
          goal.user,
          "goal",
          `🔥 You reached 80% of your goal: ${goal.name}`
        );

        goal.notificationFlags.goal80 = true;
        await goal.save();
      }

      // 50% alert
      else if (percent >= 50 && !goal.notificationFlags.goal50) {
        await createNotification(
          goal.user,
          "goal",
          `🎯 Your goal "${goal.name}" is 50% complete!`
        );

        goal.notificationFlags.goal50 = true;
        await goal.save();
      }
    }

    console.log("✅ Cron Completed Successfully");
  } catch (error) {
    console.error("❌ Cron Error:", error);
  }
});


// cron/budgetNotificationCron.js
import cron from "node-cron";
import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";
import { createNotification } from "../utils/notify.js";

cron.schedule("0 * * * *", async () => {
  try {
    console.log(" Running budget usage notification cron...");

    const budgets = await Budget.find({});
    const expenses = await Expense.find({});

    for (const budget of budgets) {
      const userId = budget.user.toString();

      const spent = expenses
        .filter(e => e.user.toString() === userId)
        .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
        .reduce((sum, e) => sum + e.amount, 0);

      const percent = Math.round((spent / budget.amount) * 100);

      if (percent >= 80 && percent < 100) {
        await createNotification(
          userId,
          "budget",
          `⚠️ ${budget.category} budget is ${percent}% used`
        );
      }

      if (percent >= 100) {
        await createNotification(
          userId,
          "budget",
          `🎯 ${budget.category} budget exceeded!`
        );
      }
    }

    console.log("🔔 Budget notification cron finished.");
  } catch (err) {
    console.error("❌ Budget Cron Error:", err.message);
  }
});

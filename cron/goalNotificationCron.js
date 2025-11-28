import cron from "node-cron";
import Goal from "../models/Goal.js";
import Expense from "../models/Expense.js";
import { createNotification } from "../utils/notify.js";

cron.schedule("0 * * * *", async () => {
  try {
    console.log("⏳ Running goal progress notification cron...");

    const goals = await Goal.find({});
    const expenses = await Expense.find({});

    for (const goal of goals) {
      const userId = goal.user.toString();

      let goalExpenses = expenses.filter(e => e.user.toString() === userId);

      if (goal.category)
        goalExpenses = goalExpenses.filter(e => e.category === goal.category);

      if (goal.startDate)
        goalExpenses = goalExpenses.filter(
          e => new Date(e.date) >= new Date(goal.startDate)
        );

      if (goal.endDate)
        goalExpenses = goalExpenses.filter(
          e => new Date(e.date) <= new Date(goal.endDate)
        );

      const total = goalExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
      const percent = Math.round((total / goal.target) * 100);

      // ---- Notifications ----

      if (percent >= 50 && !goal.notificationFlags.goal50) {
        await createNotification(
          userId,
          "goal",
          `🎯 Your goal "${goal.name}" is 50% complete! Keep going!`
        );

        goal.notificationFlags.goal50 = true;
      }

      if (percent >= 80 && !goal.notificationFlags.goal80) {
        await createNotification(
          userId,
          "goal",
          `🔥 Goal "${goal.name}" reached 80% progress! Almost there!`
        );

        goal.notificationFlags.goal80 = true;
      }

      if (percent >= 100 && !goal.notificationFlags.goal100) {
        await createNotification(
          userId,
          "goal",
          `✅ Congratulations! Goal "${goal.name}" is fully completed!`
        );

        goal.notificationFlags.goal100 = true;
      }

      await goal.save();
    }

    console.log("🎯 Goal notification cron finished.");
  } catch (err) {
    console.error("❌ Goal Cron Error:", err.message);
  }
});

import cron from "node-cron";
import Expense from "../models/Expense.js";

// Runs every day at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
  console.log("⏳ Running recurring expenses job...");

  const expenses = await Expense.find({ recurring: { $ne: "none" } });

  for (let exp of expenses) {
    let shouldCreate = false;
    const today = new Date();

    if (exp.recurring === "daily") {
      shouldCreate = true;
    } else if (exp.recurring === "weekly") {
      // check if 7 days passed since last expense date
      const diff = (today - exp.date) / (1000 * 60 * 60 * 24);
      if (diff >= 7) shouldCreate = true;
    } else if (exp.recurring === "monthly") {
      // check if 30 days passed since last expense date
      const diff = (today - exp.date) / (1000 * 60 * 60 * 24);
      if (diff >= 30) shouldCreate = true;
    }

    if (shouldCreate) {
      const newExpense = new Expense({
        user: exp.user,
        category: exp.category,
        amount: exp.amount,
        date: today,
        recurring: exp.recurring,
      });
      await newExpense.save();
      console.log("✅ Added recurring expense:", exp.category, exp.amount);
    }
  }
});

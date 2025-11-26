import cron from "node-cron";
import Expense from "../models/Expense.js";
import Notification from "../models/Notification.js";

cron.schedule("0 0 * * *", async () => {
  console.log("⏰ Recurring Expense Cron Running...");

  try {
    const today = new Date().toISOString().split("T")[0];

    const dueExpenses = await Expense.find({
      isRecurring: true,
      nextRecurringDate: today
    });

    for (const exp of dueExpenses) {
      const newExpense = new Expense({
        user: exp.user,
        category: exp.category,
        amount: exp.amount,
        date: new Date(),
        isRecurring: true,
        nextRecurringDate: null,
      });

      await newExpense.save();

      const next = new Date(exp.nextRecurringDate);
      next.setMonth(next.getMonth() + 1);

      exp.nextRecurringDate = next;
      await exp.save();

      await Notification.create({
        user: exp.user,
        message: `Recurring expense repeated: ${exp.category} - ₹${exp.amount}`,
      });
    }

    console.log("✅ Recurring Cron Finished!");

  } catch (err) {
    console.error("❌ Recurring Cron Error:", err);
  }
});

// backend/controllers/expenseController.js

import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Notification from "../models/Notification.js";

// ----------------------------------------------------
//  ADD EXPENSE
// ----------------------------------------------------
export const addExpense = async (req, res) => {
  try {
    const { category, amount, isRecurring } = req.body;
    const userId = req.user.id;

    if (!category || !amount) {
      return res
        .status(400)
        .json({ message: "Category and amount are required" });
    }

    //  Create expense
    const expense = new Expense({ ...req.body, user: userId });
    await expense.save();

    //  Find matching budget
    const budget = await Budget.findOne({ user: userId, category });
    if (budget) {
      budget.spentThisPeriod = (budget.spentThisPeriod || 0) + Number(amount);
      budget.percentUsed = Math.round(
        (budget.spentThisPeriod / budget.amount) * 100
      );
      await budget.save();

      const percent = budget.percentUsed;

      if (percent >= 80 && percent < 100) {
        await Notification.create({
          user: userId,
          type: "budget",
          message: `⚠️ You have used ${percent}% of your ${category} budget.`,
        });
      }

      if (percent >= 100) {
        await Notification.create({
          user: userId,
          type: "budget",
          message: `🚨 You exceeded your ${category} budget!`,
        });
      }
    }

    // Recurring Expense
    if (isRecurring) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      expense.nextRecurringDate = nextDate;
      await expense.save();

      await Notification.create({
        user: userId,
        message: `🔁 Recurring expense added: ${category} - ₹${amount}`,
      });
    }

    return res.status(201).json(expense);
  } catch (err) {
    console.error("🔥 Error adding expense:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ----------------------------------------------------
//  GET ALL EXPENSES
// ----------------------------------------------------
export const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({
      date: -1,
    });
    return res.status(200).json(expenses);
  } catch (err) {
    console.error("🔥 Error fetching expenses:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ----------------------------------------------------
//  DELETE EXPENSE
// ----------------------------------------------------
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // rollback budget
    const budget = await Budget.findOne({
      user: req.user.id,
      category: expense.category,
    });
    if (budget) {
      budget.spent = Math.max(0, budget.spent - expense.amount);
      await budget.save();
    }

    await expense.deleteOne();

    return res.status(200).json({ message: "Expense deleted" });
  } catch (err) {
    console.error("🔥 Error deleting expense:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ----------------------------------------------------
//  UPDATE / EDIT EXPENSE
// ----------------------------------------------------
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    const oldAmount = expense.amount;
    const oldCategory = expense.category;

    // update fields
    Object.assign(expense, req.body);
    await expense.save();

    // Sync Budget
    const newBudget = await Budget.findOne({
      user: req.user.id,
      category: expense.category,
    });

    const oldBudget = await Budget.findOne({
      user: req.user.id,
      category: oldCategory,
    });

    // rollback old budget spent
    if (oldBudget) {
      oldBudget.spent = Math.max(0, oldBudget.spent - oldAmount);
      await oldBudget.save();
    }

    // apply new budget spent
    if (newBudget) {
      newBudget.spent = (newBudget.spent || 0) + Number(expense.amount);
      await newBudget.save();
    }

    return res.status(200).json(expense);
  } catch (err) {
    console.error("🔥 Error updating expense:", err);
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};

// ----------------------------------------------------
//  AUTO-RUN RECURRING EXPENSES (CRON)
// ----------------------------------------------------
export const processRecurringExpenses = async () => {
  try {
    const today = new Date();

    const recurringExpenses = await Expense.find({
      isRecurring: true,
      nextRecurringDate: { $lte: today },
    });

    for (const exp of recurringExpenses) {
      // create a new instance
      const newExpense = new Expense({
        user: exp.user,
        category: exp.category,
        amount: exp.amount,
        isRecurring: true,
      });

      await newExpense.save();

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      exp.nextRecurringDate = nextDate;
      await exp.save();

      await Notification.create({
        user: exp.user,
        message: `🔁 Recurring expense processed: ${exp.category} - ₹${exp.amount}`,
      });

      // update budget
      const budget = await Budget.findOne({
        user: exp.user,
        category: exp.category,
      });
      if (budget) {
        budget.spent += Number(exp.amount);
        await budget.save();
      }
    }

    console.log("✅ Recurring expenses processed.");
  } catch (err) {
    console.error("🔥 Error processing recurring expenses:", err);
  }
};

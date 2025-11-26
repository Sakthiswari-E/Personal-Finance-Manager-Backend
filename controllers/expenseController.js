//backend\controllers\expenseController.js
import Expense from "../models/Expense.js";

import Budget from "../models/Budget.js";

export const addExpense = async (req, res) => {
  try {
    const { category, amount, isRecurring } = req.body;
    const userId = req.user.id;

    // 1️⃣ Create new expense
    const expense = new Expense({ ...req.body, user: userId });
    await expense.save();

    // 2️⃣ Update budget if exists
    const budget = await Budget.findOne({ user: userId, category });
    if (budget) {
      budget.spent = (budget.spent || 0) + Number(amount);
      await budget.save();
    }

    // 3️⃣ Handle recurring logic
    if (isRecurring) {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      expense.nextRecurringDate = nextDate;
      await expense.save();

      // 4️⃣ Notification for recurring expense
      await Notification.create({
        user: userId,
        message: `Recurring expense added: ${category} - ₹${amount}`,
      });
    }

    // 5️⃣ Final response
    return res.status(201).json(expense);

  } catch (err) {
    console.error("🔥 Error adding expense:", err);

    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};


export const createExpense = async (req, res) => {
  try {
    const { type, category, description, amount, date } = req.body;

    if (!type || !category || !amount) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const userId =
      process.env.DEV_MODE === "true"
        ? "000000000000000000000000"
        : req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized — user missing" });
    }

    const expense = await Expense.create({
      user: userId,
      type,
      category,
      description,
      amount,
      date: date || new Date(),
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error("Error creating expense:", error);
    res.status(500).json({ message: "Server error creating expense" });
  }
};

export const getExpenses = async (req, res) => {
  try {
    const userId =
      process.env.DEV_MODE === "true"
        ? "000000000000000000000000"
        : req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized — user missing" });
    }

    const expenses = await Expense.find({ user: userId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error fetching expenses" });
  }
};

export const getExpenseById = async (req, res) => {
  try {
    const userId =
      process.env.DEV_MODE === "true"
        ? "000000000000000000000000"
        : req.user?._id;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    res.status(500).json({ message: "Server error fetching expense" });
  }
};

export const updateExpense = async (req, res) => {
  try {
    const userId =
      process.env.DEV_MODE === "true"
        ? "000000000000000000000000"
        : req.user?._id;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    expense.type = req.body.type || expense.type;
    expense.category = req.body.category || expense.category;
    expense.description = req.body.description || expense.description;
    expense.amount = req.body.amount || expense.amount;
    expense.date = req.body.date || expense.date;

    const updatedExpense = await expense.save();
    res.status(200).json(updatedExpense);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error updating expense" });
  }
};





export const deleteExpense = async (req, res) => {
  try {
    const userId =
      process.env.DEV_MODE === "true"
        ? "000000000000000000000000"
        : req.user?._id;

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: userId,
    });

    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }

    await expense.deleteOne();
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ message: "Server error deleting expense" });
  }
};

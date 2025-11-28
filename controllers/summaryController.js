import Budget from "../models/Budget.js";
import Expense from "../models/Expense.js";

export const getSummary = async (req, res) => {
  try {
    const userId = req.user._id; 

    //  Fetch user budgets and expenses
    const budgets = await Budget.find({ user: userId });
    const expenses = await Expense.find({ user: userId });

    let totalBudget = 0;
    let totalSpent = 0;

    // Safe summary data for dashboard
    const categories = budgets.map(budget => {
      const spent = expenses
        .filter(exp => exp.category === budget.category)
        .reduce((sum, exp) => sum + exp.amount, 0);

      totalBudget += budget.amount;
      totalSpent += spent;

      return {
        category: budget.category,
        budget: budget.amount,
        spent,
        remaining: budget.amount - spent,
        percentUsed: budget.amount > 0
          ? Math.round((spent / budget.amount) * 100)
          : 0,
      };
    });

    // Response shape matches frontend SummaryPage.jsx
    res.json({
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      categories,
    });

  } catch (err) {
    console.error("🔥 Error in getSummary:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

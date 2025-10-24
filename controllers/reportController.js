// controllers/reportController.js
import mongoose from "mongoose";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";

const DEV_MODE = process.env.DEV_MODE === "true";
const DEV_USER_ID = new mongoose.Types.ObjectId("000000000000000000000000");

function getUserFilter(req) {
  if (DEV_MODE) return { user: DEV_USER_ID };
  const uid = req.user?.id || req.user;
  if (!uid) return null;
  try {
    return { user: new mongoose.Types.ObjectId(uid) };
  } catch {
    return { user: uid };
  }
}

function parseDateRange(startQ, endQ) {
  let start, end;
  if (startQ) {
    start = new Date(startQ);
    start.setHours(0, 0, 0, 0);
  }
  if (endQ) {
    end = new Date(endQ);
    end.setHours(23, 59, 59, 999);
  }
  return { start, end };
}

export const getSummary = async (req, res) => {
  try {
    const filter = getUserFilter(req);
    if (!filter) return res.status(401).json({ error: "Unauthorized" });

    const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = start;
      if (end) filter.date.$lte = end;
    }

    const totalAgg = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpenses = totalAgg[0]?.total || 0;

    
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const trendAgg = await Expense.aggregate([
      { $match: { ...filter, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      months.push(`${d.getFullYear()}-${mm}`);
    }
    const trendMap = {};
    trendAgg.forEach((t) => (trendMap[t._id] = t.total));
    const trend = months.map((m) => ({ date: m, total: trendMap[m] || 0 }));

    const categoriesAgg = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
    ]);
    const byCategory = categoriesAgg.map((c) => ({
      category: c._id || "Uncategorized",
      amount: c.total,
    }));

    const recentDocs = await Expense.find(filter).sort({ date: -1 }).limit(5).lean();
    const items = recentDocs.map((r) => ({
      id: r._id,
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
      category: r.category,
      description: r.description || "",
      amount: r.amount,
    }));

    res.json({ summary: { totalExpenses }, trend, byCategory, items });
  } catch (err) {
    console.error("getSummary error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};


export const getExpenseReport = async (req, res) => {
  try {
    const filter = getUserFilter(req);
    if (!filter) return res.status(401).json({ error: "Unauthorized" });

    const { start, end } = parseDateRange(req.query.startDate, req.query.endDate);
    if (start || end) {
      filter.date = {};
      if (start) filter.date.$gte = start;
      if (end) filter.date.$lte = end;
    }
    if (req.query.category) filter.category = req.query.category;

    const items = await Expense.find(filter).sort({ date: -1 }).limit(100).lean();

    const byCategoryAgg = await Expense.aggregate([
      { $match: filter },
      { $group: { _id: "$category", amount: { $sum: "$amount" } } },
      { $sort: { amount: -1 } },
    ]);
    const byCategory = byCategoryAgg.map((r) => ({
      category: r._id || "Uncategorized",
      amount: r.amount,
    }));

    const now = new Date();
    const startDate = start || new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    startDate.setHours(0, 0, 0, 0);
    const endDate = end || new Date();
    endDate.setHours(23, 59, 59, 999);

    const matchForDaily = { ...filter, date: { $gte: startDate, $lte: endDate } };
    const dailyAgg = await Expense.aggregate([
      { $match: matchForDaily },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dailyMap = {};
    dailyAgg.forEach((d) => (dailyMap[d._id] = d.total));
    const dailyTrend = [];
    let cur = new Date(startDate);
    while (cur <= endDate) {
      const key = cur.toISOString().slice(0, 10);
      dailyTrend.push({ date: key, total: dailyMap[key] || 0 });
      cur.setDate(cur.getDate() + 1);
    }

    res.json({ byCategory, dailyTrend, items });
  } catch (err) {
    console.error("getExpenseReport error:", err);
    res.status(500).json({ error: "Failed to fetch expense report" });
  }
};

export const getBudgetReport = async (req, res) => {
  try {
    const filter = getUserFilter(req);
    if (!filter) return res.status(401).json({ error: "Unauthorized" });

    const budgets = await Budget.find(filter).lean();

    // Map for spending by category this period
    const spentMap = {};

    for (const budget of budgets) {
      let startDate, endDate;
      const now = new Date();

      if (budget.period === "yearly") {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      } else {
        // monthly (default)
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      }

      const match = {
        ...filter,
        category: budget.category,
        date: { $gte: startDate, $lte: endDate },
      };

      const agg = await Expense.aggregate([
        { $match: match },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      spentMap[budget.category] = agg[0]?.total || 0;
    }

    const result = budgets.map((b) => {
      const spent = spentMap[b.category] || 0;
      const remaining = Math.max(0, b.amount - spent);
      const percentUsed = b.amount ? Math.min(100, Math.round((spent / b.amount) * 100)) : 0;

      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        period: b.period,
        spentThisPeriod: spent,
        remaining,
        percentUsed,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("getBudgetReport error:", err);
    res.status(500).json({ error: "Failed to fetch budget report" });
  }
};

export const getIncomeReport = async (req, res) => {
  try {
    res.json({ totalIncome: 0, sources: [], monthlyTrend: [] });
  } catch (err) {
    console.error("getIncomeReport error:", err);
    res.status(500).json({ error: "Failed to fetch income report" });
  }
};

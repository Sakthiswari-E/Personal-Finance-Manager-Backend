// backend/src/routes/forecast.js
import express from "express";
import { protect } from "../middleware/auth.js";
import Expense from "../models/Expense.js";
import Income from "../models/Income.js";

// Initialize router
const router = express.Router();

// Helper: get start-of-month date
function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Helper: format YYYY-MM
function fmtYM(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

// Simple linear regression (x: array, y: array) -> {slope, intercept}
function linearRegression(x, y) {
  const n = x.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (x[i] - meanX) * (y[i] - meanY);
    den += (x[i] - meanX) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = meanY - slope * meanX;
  return { slope, intercept };
}

// GET /api/forecast?historyMonths=6&forecastMonths=6
router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const historyMonths = parseInt(req.query.historyMonths) || 6;
    const forecastMonths = parseInt(req.query.forecastMonths) || 6;

    const today = new Date();
    const startDate = new Date(
      today.getFullYear(),
      today.getMonth() - (historyMonths - 1),
      1
    );

    // Fetch expenses and incomes
    const expenses = await Expense.find({
      userId,
      date: { $gte: startDate },
    }).lean();

    const incomes = await Income.find({
      userId,
      date: { $gte: startDate },
    }).lean();

    // Accumulate totals per month
    const monthly = {};
    for (let i = 0; i < historyMonths; i++) {
      const d = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1);
      monthly[fmtYM(d)] = {
        monthStart: startOfMonth(d),
        expenses: 0,
        incomes: 0,
      };
    }

    const addToMonthly = (arr, keyField) => {
      for (const item of arr) {
        const dt = new Date(item.date);
        const key = fmtYM(dt);
        if (!monthly[key]) continue;
        monthly[key][keyField] += Number(item.amount || 0);
      }
    };

    addToMonthly(expenses, "expenses");
    addToMonthly(incomes, "incomes");

    const months = Object.keys(monthly).sort();
    const hist = months.map((m) => ({
      month: m,
      monthStart: monthly[m].monthStart,
      expenses: monthly[m].expenses,
      incomes: monthly[m].incomes,
      net: monthly[m].incomes - monthly[m].expenses,
    }));

    const x = hist.map((_, i) => i);
    const y = hist.map((m) => m.net);
    const { slope, intercept } = linearRegression(x, y);

    const lastMonthDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + historyMonths - 1,
      1
    );

    const forecast = [];
    for (let f = 1; f <= forecastMonths; f++) {
      const mDate = new Date(
        lastMonthDate.getFullYear(),
        lastMonthDate.getMonth() + f,
        1
      );
      const idx = hist.length + (f - 1);
      const predictedNet = slope * idx + intercept;
      forecast.push({
        month: fmtYM(mDate),
        monthStart: startOfMonth(mDate),
        predictedNet: Number(predictedNet.toFixed(2)),
      });
    }

    const monthlyAvgNet = hist.length
      ? y.reduce((a, b) => a + b, 0) / y.length
      : 0;
    const totalProjectedNet = forecastMonths * monthlyAvgNet;

    const projectionSummary = {
      monthlyAvgNet: Number(monthlyAvgNet.toFixed(2)),
      totalProjectedNet: Number(totalProjectedNet.toFixed(2)),
      note: `Projection based on ${historyMonths} months history and linear trend.`,
    };

    return res.json({
      historyMonths,
      forecastMonths,
      history: hist,
      forecast,
      regression: {
        slope: Number(slope.toFixed(6)),
        intercept: Number(intercept.toFixed(2)),
      },
      projectionSummary,
    });
  } catch (err) {
    console.error("Forecast error", err);
    return res.status(500).json({ msg: "Server error" });
  }
});


export default router;

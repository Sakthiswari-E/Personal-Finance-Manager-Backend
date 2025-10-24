// backend/routes/reports.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getSummary, getExpenseReport, getBudgetReport } from "../controllers/reportController.js";
import Expense from "../models/Expense.js";
import User from "../models/User.js";
import { Parser as CsvParser } from "json2csv";
import PDFDocument from "pdfkit";
import PDFTable from "pdfkit-table";

const router = express.Router();

/**
 *  Dashboard Summary Route
 */
router.get("/summary", protect, getSummary);

/**
 *  Expense and Budget Reports
 */
router.get("/expenses", protect, getExpenseReport);
router.get("/budgets", protect, getBudgetReport);

/**
 *  Income Report
 */
router.get("/income", protect, async (req, res) => {
  try {
    const incomes = await Expense.find({ user: req.user._id, type: "income" }).lean();

    const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);

    // Group by source
    const sources = incomes.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + item.amount;
      return acc;
    }, {});

    // Monthly trend
    const monthlyTrend = incomes.reduce((acc, item) => {
      const month = new Date(item.date).toLocaleString("default", { month: "short", year: "numeric" });
      acc[month] = (acc[month] || 0) + item.amount;
      return acc;
    }, {});

    res.json({
      totalIncome,
      sources: Object.entries(sources).map(([source, amount]) => ({ source, amount })),
      monthlyTrend: Object.entries(monthlyTrend).map(([month, total]) => ({ month, total }))
    });

  } catch (err) {
    console.error("Income report error:", err);
    res.status(500).json({ message: "Failed to fetch income report" });
  }
});


/**
 * Export as CSV
 */
router.get("/export/csv", protect, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user._id }).lean();

    if (!expenses.length) {
      return res.status(404).json({ message: "No expense data found for export" });
    }

    const fields = ["date", "category", "description", "amount", "type"];
    const parser = new CsvParser({ fields });
    const csv = parser.parse(expenses);

    res.header("Content-Type", "text/csv");
    res.attachment("expenses.csv");
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});


/**
 * PDF Export (Clean Format with Footer)
 */
router.get("/export/pdf", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).lean();
    const expenses = await Expense.find({ user: req.user._id }).sort({ date: -1 }).lean();

    if (!expenses.length) {
      return res.status(404).json({ message: "No expenses found to generate PDF" });
    }

    //  Sanitize amounts
    const validExpenses = expenses.map(e => ({
      ...e,
      amount: isNaN(e.amount) || e.amount === null ? 0 : e.amount,
      date: e.date ? new Date(e.date) : new Date(),
      category: e.category || "Unknown",
      description: e.description || "-"
    }));

    //  Summary
    const totalAmount = validExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalTransactions = validExpenses.length;

    const categoryTotals = {};
    validExpenses.forEach(e => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryTotals).length
      ? Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0][0]
      : "N/A";

    //  Create PDF
    const doc = new PDFDocument({ margin: 40 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=personal_finance_report.pdf");
    doc.pipe(res);

    // Background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0f172a");
    doc.fillColor("#ffffff");

    // Header
    doc
      .fontSize(22)
      .fillColor("#14b8a6")
      .text("Personal Finance Report", { align: "center" })
      .moveDown(0.5);

    doc
      .fontSize(10)
      .fillColor("#e2e8f0")
      .text(`User: ${user.name}`, { align: "center" })
      .text(`Email: ${user.email}`, { align: "center" })
  
      .text(`Generated: ${new Date().toLocaleDateString()}`, { align: "center" })
      .moveDown(1.5);

    // Summary
    doc.fontSize(14).fillColor("#14b8a6").text("Summary", { underline: true }).moveDown(0.5);
    doc.fontSize(11).fillColor("#ffffff");
    doc.text(`Total Expenses: ₹${totalAmount.toFixed(2)}`);
    doc.text(`Total Transactions: ${totalTransactions}`);
    doc.text(`Top Category: ${topCategory}`).moveDown(1.5);

    // Table Header
    doc.fontSize(13).fillColor("#14b8a6").text("Transactions", { underline: true }).moveDown(0.5);
    doc.fontSize(11).fillColor("#14b8a6");
    doc.text("Date", 50).text("Category", 150).text("Description", 260).text("Amount (₹)", 480);
    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke("#14b8a6").moveDown(0.5);

    // Table Rows
    doc.fillColor("#e2e8f0");
    validExpenses.forEach(e => {
      doc
        .fontSize(10)
        .text(e.date.toLocaleDateString(), 50)
        .text(e.category, 150)
        .text(e.description, 260)
        .text(e.amount.toFixed(2), 480);
      doc.moveDown(0.3);
    });

    // Footer
    doc.moveDown(2);
    doc.fontSize(9).fillColor("#94a3b8")
      .text("Generated by Personal Finance Manager © 2025", { align: "center" });

    doc.end();

  } catch (err) {
    console.error("PDF Export Error:", err);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate PDF" });
    }
  }
});

 export default router;

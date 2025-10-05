// backend/src/routes/export.js
import express from "express";
import { Parser } from "json2csv";
import PDFDocument from "pdfkit";
import archiver from "archiver";
import { authMiddleware } from "../middleware/auth.js";
import Expense from "../models/Expense.js";
import Budget from "../models/Budget.js";
import Goal from "../models/Goal.js";

const router = express.Router();

// Utility to generate PDF table
function addTable(doc, title, headers, rows, startY = 100) {
  doc.fontSize(14).fillColor("#2C3E50").text(title, 50, startY);
  doc.moveDown(0.5);
  let y = startY + 20;

  doc.fontSize(11).fillColor("#000");
  const colWidth = 500 / headers.length;
  headers.forEach((h, i) => doc.text(h, 50 + i * colWidth, y));

  doc
    .moveTo(50, y + 15)
    .lineTo(550, y + 15)
    .strokeColor("#aaa")
    .stroke();
  y += 25;

  rows.forEach((r, idx) => {
    if (idx % 2 === 0)
      doc.rect(45, y - 5, 510, 20).fillAndStroke("#F9FAFB", "#EAEAEA");
    doc.fillColor("#000").fontSize(10);
    r.forEach((cell, i) => {
      doc.text(String(cell), 50 + i * colWidth, y, { width: colWidth - 10 });
    });
    y += 20;
    if (y > 750) {
      doc.addPage();
      y = 60;
    }
  });
  return y + 10;
}

// Export Expenses (CSV)
router.get("/expenses/csv", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean();
    if (!expenses.length)
      return res.status(404).json({ message: "No expenses found" });

    const parser = new Parser({
      fields: ["date", "category", "amount", "description", "type"],
    });
    const csv = parser.parse(expenses);

    res.header("Content-Type", "text/csv");
    res.attachment("expenses.csv");
    res.send(csv);
  } catch (err) {
    console.error("CSV export error:", err);
    res.status(500).json({ message: "Error exporting CSV" });
  }
});

//Export Budgets (CSV)
router.get("/budgets/csv", authMiddleware, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).lean();
    if (!budgets.length)
      return res.status(404).json({ message: "No budgets found" });

    const parser = new Parser({ fields: ["category", "limit"] });
    const csv = parser.parse(budgets);

    res.header("Content-Type", "text/csv");
    res.attachment("budgets.csv");
    res.send(csv);
  } catch (err) {
    console.error("Budget export error:", err);
    res.status(500).json({ message: "Error exporting budgets" });
  }
});

// Export Goals (CSV)
router.get("/goals/csv", authMiddleware, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user.id }).lean();
    if (!goals.length)
      return res.status(404).json({ message: "No goals found" });

    const parser = new Parser({
      fields: ["title", "targetAmount", "savedAmount", "deadline"],
    });
    const csv = parser.parse(goals);

    res.header("Content-Type", "text/csv");
    res.attachment("goals.csv");
    res.send(csv);
  } catch (err) {
    console.error("Goal export error:", err);
    res.status(500).json({ message: "Error exporting goals" });
  }
});

//Export Full Report (PDF)
router.get("/report/pdf", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean();
    const budgets = await Budget.find({ user: req.user.id }).lean();
    const goals = await Goal.find({ user: req.user.id }).lean();

    const doc = new PDFDocument({ margin: 40, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Full_Report.pdf"
    );
    doc.pipe(res);

    doc
      .fontSize(20)
      .fillColor("#1E3A8A")
      .text("Personal Finance Summary Report", { align: "center" });
    doc
      .moveDown(0.5)
      .fontSize(10)
      .fillColor("#555")
      .text(`Generated on ${new Date().toLocaleString()}`, {
        align: "center",
      });
    doc.moveDown(1.5);

    let y = addTable(
      doc,
      "Expenses",
      ["Date", "Category", "Amount", "Description", "Type"],
      expenses.map((e) => [
        e.date?.toISOString()?.slice(0, 10),
        e.category,
        `₹${e.amount}`,
        e.description || "-",
        e.type,
      ]),
      120
    );

    y = addTable(
      doc,
      "Budgets",
      ["Category", "Limit"],
      budgets.map((b) => [b.category, `₹${b.limit}`]),
      y + 20
    );

    addTable(
      doc,
      "Goals",
      ["Title", "Target", "Saved", "Deadline"],
      goals.map((g) => [
        g.title,
        `₹${g.targetAmount}`,
        `₹${g.savedAmount}`,
        g.deadline?.toISOString()?.slice(0, 10),
      ]),
      y + 20
    );

    doc.end();
  } catch (err) {
    console.error("PDF export error:", err);
    res.status(500).json({ message: "Error generating PDF report" });
  }
});

//  Export All (ZIP)
router.get("/all/zip", authMiddleware, async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).lean();
    const budgets = await Budget.find({ user: req.user.id }).lean();
    const goals = await Goal.find({ user: req.user.id }).lean();

    const archive = archiver("zip");
    res.setHeader("Content-Type", "application/zip");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Full_Data_Export.zip"
    );

    const expParser = new Parser({
      fields: ["date", "category", "amount", "description", "type"],
    });
    archive.append(expParser.parse(expenses), { name: "expenses.csv" });

    const budParser = new Parser({ fields: ["category", "limit"] });
    archive.append(budParser.parse(budgets), { name: "budgets.csv" });

    const goalParser = new Parser({
      fields: ["title", "targetAmount", "savedAmount", "deadline"],
    });
    archive.append(goalParser.parse(goals), { name: "goals.csv" });

    archive.pipe(res);
    archive.finalize();
  } catch (err) {
    console.error("ZIP export error:", err);
    res.status(500).json({ message: "Error creating ZIP export" });
  }
});

export default router;

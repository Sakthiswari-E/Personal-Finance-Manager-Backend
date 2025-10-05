// backend/src/models/Expense.js
import mongoose from "mongoose";

const recurrenceSchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      default: "monthly",
    },
    startDate: { type: Date },
    endDate: { type: Date },
    lastGeneratedAt: { type: Date },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    category: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["expense", "income"], default: "expense" },

    // recurrence info (template only)
    recurrence: { type: recurrenceSchema, default: () => ({}) },

    // If this expense was auto-created from a recurring template, this points to that template _id
    generatedFromRecurring: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
      default: null,
    },
  },
  { timestamps: true }
);

// Index assists some lookups (not unique)
expenseSchema.index({ generatedFromRecurring: 1, date: 1 }, { unique: false });

const Expense = mongoose.model("Expense", expenseSchema);
export default Expense;

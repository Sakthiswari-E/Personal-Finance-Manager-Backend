//backend\models\Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, required: true, trim: true, lowercase: true },
  amount: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now },
 
  //  Recurring logic
  isRecurring: { type: Boolean, default: false },
  recurrenceInterval: {
    type: String,
    enum: ["none", "daily", "weekly", "monthly"],
    default: "none",
  },
  nextRecurrenceDate: { type: Date, default: null },
});

export default mongoose.model("Expense", expenseSchema);

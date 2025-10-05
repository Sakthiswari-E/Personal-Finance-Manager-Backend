// backend/src/models/Budget.js
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: { type: String, required: true },
    limit: { type: Number, required: true },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Budget", budgetSchema);

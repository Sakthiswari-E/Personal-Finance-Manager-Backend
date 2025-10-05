import mongoose from "mongoose";
const incomeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    date: { type: Date, required: true, default: Date.now },
    source: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);

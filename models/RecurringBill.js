import mongoose from "mongoose";

const recurringBillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  amount: Number,
  dueDate: String, 
});

export default mongoose.model("RecurringBill", recurringBillSchema);

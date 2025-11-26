import mongoose from "mongoose";

const recurringBillSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },


  dueDate: {
    type: String,
    required: true,
  },


  nextDueDate: {
    type: String,
    required: true,
  },
});

export default mongoose.model("RecurringBill", recurringBillSchema);

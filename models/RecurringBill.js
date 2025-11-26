// import mongoose from "mongoose";

// const recurringBillSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },

//   name: {
//     type: String,
//     required: true,
//   },

//   amount: {
//     type: Number,
//     required: true,
//   },


//   dueDate: {
//     type: String,
//     required: true,
//   },


//   nextDueDate: {
//     type: String,
//     required: true,
//   },
// });

import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },

  category: { 
    type: String, 
    required: true 
  },

  amount: { 
    type: Number, 
    required: true 
  },

  isRecurring: { 
    type: Boolean, 
    default: false 
  },

  recurringEvery: { 
    type: String, 
    enum: ["monthly"], 
    default: "monthly" 
  },

  nextRecurringDate: { 
    type: Date 
  },
});

export default mongoose.model("RecurringExpense", recurringExpenseSchema);

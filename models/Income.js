// import mongoose from "mongoose";

// const incomeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     source: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     amount: {
//       type: Number,
//       required: true,
//       min: 0,
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//     notes: {
//       type: String,
//       trim: true,
//     },
//   },
//   { timestamps: true }
// );

// incomeSchema.index({ user: 1, date: -1 });

// const Income = mongoose.model("Income", incomeSchema);

// export default Income;



// //Backend\models\Income.js
// import mongoose from "mongoose";

// const incomeSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     source: {
//       type: String,
//       required: true, // Salary, Freelance, Business
//     },
//     amount: {
//       type: Number,
//       required: true,
//     },
//     date: {
//       type: Date,
//       default: Date.now,
//     },
//     note: {
//       type: String,
//     },
//   },
//   { timestamps: true }
// );

// export default mongoose.model("Income", incomeSchema);



import mongoose from "mongoose";

const incomeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Income", incomeSchema);

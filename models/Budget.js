//backend\models\Budget.js
import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    //  Linked user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    //  Category name (e.g., food, transport)
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true, // normalize for matching (e.g., "Food" == "food")
    },

    //  Budgeted amount
    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    //  Optional description for notes
    description: {
      type: String,
      trim: true,
      default: "",
    },

    //  Budget period (monthly, weekly, yearly, or custom)
    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly", "custom"],
      default: "monthly",
    },

    // Custom start & end dates (for custom budgets)
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },

    //  Real-time tracking fields
    spentThisPeriod: {
      type: Number,
      default: 0,
    },
    remaining: {
      type: Number,
      default: 0,
    },
    percentUsed: {
      type: Number,
      default: 0,
    },

    //  Alert & UI customization
    alertThreshold: {
      type: Number, // % of budget used before alerting
      default: 80,
      min: 0,
      max: 100,
    },
    color: {
      type: String,
      default: "#14b8a6", // default teal color
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

//  Prevent duplicate budgets per user/category/period
budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

//  Auto-calculate derived fields before saving
budgetSchema.pre("save", function (next) {
  if (this.amount > 0) {
    this.remaining = Math.max(0, this.amount - this.spentThisPeriod);
    this.percentUsed = Math.min(
      100,
      Math.round((this.spentThisPeriod / this.amount) * 100)
    );
  }
  next();
});

const Budget = mongoose.model("Budget", budgetSchema);

export default Budget;

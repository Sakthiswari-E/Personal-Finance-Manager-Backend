import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    period: {
      type: String,
      enum: ["weekly", "monthly", "yearly", "custom"],
      default: "monthly",
    },

    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },

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

    alertThreshold: {
      type: Number,
      default: 80,
    },

    color: {
      type: String,
      default: "#14b8a6",
    },

    notificationsEnabled: {
      type: Boolean,
      default: true,
    },

    notificationFlags: {
      budget80: { type: Boolean, default: false },
      budget100: { type: Boolean, default: false }
    }
  },
  { timestamps: true }
);

budgetSchema.index({ user: 1, category: 1, period: 1 }, { unique: true });

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
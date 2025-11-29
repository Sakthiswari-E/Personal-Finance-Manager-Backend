import mongoose from "mongoose";

const SettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    currency: {
      type: String,
      default: "INR", 
    },
    language: {
      type: String,
      default: "en",
    },
    theme: {
      type: String,
      default: "dark",
    },
    notifications: {
      budgetAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Settings", SettingsSchema);

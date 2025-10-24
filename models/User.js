import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 6 },
    currency: {
      type: String,
      default: "USD",
      enum: ["USD", "EUR", "GBP", "INR", "JPY", "CAD", "AUD"],
    },
    language: {
      type: String,
      default: "en",
      enum: ["en", "es", "fr", "de", "hi", "zh"],
    },
    notifications: {
      emailUpdates: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

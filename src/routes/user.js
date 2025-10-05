import express from "express";
import protect from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.json(user);
});

router.put("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).json({ message: "User not found" });

  const { name, currency, notificationPreferences, monthlyIncome } = req.body;
  if (name) user.name = name;
  if (currency) user.currency = currency;
  if (notificationPreferences)
    user.notificationPreferences = notificationPreferences;
  if (monthlyIncome != null) user.monthlyIncome = monthlyIncome;
  await user.save();
  res.json(user);
});

export default router;

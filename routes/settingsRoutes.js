//backend\routes\settingsRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import Settings from "../models/Settings.js";

const router = express.Router();

// GET settings
router.get("/", protect, async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.user._id });

    if (!settings) {
      settings = await Settings.create({
        userId: req.user._id,
        currency: "INR",
        language: "en",
        theme: "dark",
        notifications: { emailUpdates: true, budgetAlerts: true }
      });
    }

    res.json(settings);
  } catch (err) {
    console.error("❌ Settings fetch error:", err);
    res.status(500).json({ message: "Server error fetching settings" });
  }
});

// UPDATE settings
router.put("/", protect, async (req, res) => {
  try {
    const updates = req.body;
    const settings = await Settings.findOneAndUpdate(
      { userId: req.user._id },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({ message: "✅ Settings updated!", settings });
  } catch (err) {
    console.error("❌ Settings update error:", err);
    res.status(500).json({ message: "Failed to update settings" });
  }
});

export default router;

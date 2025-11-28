// backend/controllers/settingsController.js
import Settings from "../models/Settings.js";

//  Get current user's settings
export const getSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    let settings = await Settings.findOne({ userId });

    // Create default settings if not found
    if (!settings) {
      settings = await Settings.create({
        userId,
        currency: "USD",
        language: "English",
        dateFormat: "DD/MM/YYYY",
        theme: "dark",
        notifications: true,
      });
    }

    res.status(200).json(settings);
  } catch (err) {
    console.error("💥 getSettings error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//  Update user settings
export const updateSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const updates = req.body;

    const updated = await Settings.findOneAndUpdate(
      { userId },
      { $set: updates },
      { new: true, upsert: true }
    );

    res.json({
      message: "Settings updated successfully!",
      settings: updated,
    });
  } catch (err) {
    console.error("🔥 updateSettings error:", err);
    res.status(500).json({ error: "Failed to update settings", details: err.message });
  }
};

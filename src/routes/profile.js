import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

/* READ PROFILE  */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Make sure we always send a clean structure
    res.json({
      name: user.name || "",
      email: user.email || "",
      profile: {
        currency: user.profile?.currency || "₹",
        categories: user.profile?.categories || ["Food", "Rent", "Transport"],
        notifications: user.profile?.notifications || {
          budgetAlerts: true,
          upcomingBills: true,
          goalProgress: true,
        },
      },
    });
  } catch (err) {
    console.error(" Profile fetch error:", err);
    res.status(500).json({ message: "Server error fetching profile" });
  }
});

/*  UPDATE PROFILE  */
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { name, email, profile } = req.body;

    const updateData = {
      name,
      email,
      profile: {
        currency: profile?.currency || "₹",
        categories: profile?.categories || ["Food", "Rent", "Transport"],
        notifications: profile?.notifications || {
          budgetAlerts: true,
          upcomingBills: true,
          goalProgress: true,
        },
      },
    };

    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json({ message: "Profile updated successfully", user: updatedUser });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ message: "Server error updating profile" });
  }
});

export default router;

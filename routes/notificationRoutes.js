import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ----------------------------
   GET all notifications  
---------------------------- */
router.get("/", protect, async (req, res) => {
  try {
    const list = await Notification.find({ userId: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(list);
  } catch (err) {
    console.error("Get Notifications Error:", err);
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

/* ----------------------------
   MARK notification as read
---------------------------- */
router.put("/:notificationId/read", protect, async (req, res) => {
  try {
    const n = await Notification.findById(req.params.notificationId);

    if (!n) {
      return res.status(404).json({ message: "Notification not found" });
    }

    n.isRead = true;
    await n.save();

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("Read Notification Error:", err);
    res.status(500).json({ message: "Error marking notification as read" });
  }
});

/* ----------------------------
   DELETE a notification
---------------------------- */
router.delete("/:notificationId", protect, async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(
      req.params.notificationId
    );

    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Delete Notification Error:", err);
    res.status(500).json({ message: "Failed to delete notification" });
  }
});

/* ----------------------------
   TEST ROUTE 
---------------------------- */
router.get("/test/run", (req, res) => {
  res.send("✔ Notification routes are connected");
});

export default router;

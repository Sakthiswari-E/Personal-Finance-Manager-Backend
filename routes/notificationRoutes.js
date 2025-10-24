// backend/routes/notificationRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getNotifications,
  markAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

const router = express.Router();

// ✅ Get all notifications
router.get("/", protect, getNotifications);

// ✅ Mark single notification as read
router.put("/:id/read", protect, markAsRead);

// ✅ Delete notification
router.delete("/:id", protect, deleteNotification);

export default router;

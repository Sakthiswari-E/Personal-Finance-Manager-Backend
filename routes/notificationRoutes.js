import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
  markAllAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.put("/:id/read", protect, markAsRead);
router.put("/mark-all", protect, markAllAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;
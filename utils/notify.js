// utils/notify.js
import Notification from "../models/Notification.js";

export const createNotification = async (userId, type, message) => {
  try {
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const exists = await Notification.findOne({
      userId,
      type,
      message,
      createdAt: { $gte: fourHoursAgo }
    });

    if (exists) return; // prevent spam

    return await Notification.create({
      userId,
      type,
      message,
      isRead: false
    });

  } catch (err) {
    console.error("❌ Notification Error:", err);
  }
};
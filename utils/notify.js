import Notification from "../models/Notification.js";

export const createNotification = async (userId, type, message) => {
  try {
    await Notification.create({
      userId,
      type,    
      message,
    });
  } catch (err) {
    console.error("❌ Notification Error:", err);
  }
};

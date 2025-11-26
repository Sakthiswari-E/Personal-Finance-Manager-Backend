// backend/utils/notify.js
import Notification from "../models/Notification.js";

// export const createNotification = async (userId, type, message) => {
export const createNotification = async (userId, type, message) => {

  try {
    // Prevent duplicates within last 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const exists = await Notification.findOne({
      userId: userId,      // ✅ FIXED
      type,
      message,
      createdAt: { $gte: twoHoursAgo }
    });

    if (exists) return; // Skip duplicate

    const notif = await Notification.create({
      userId: userId,      // ✅ FIXED
      type,
      message,
      isRead: false
    });

    return notif;
  } catch (err) {
    console.error("❌ Notification Error:", err);
  }
};

// import Notification from "../models/Notification.js";

// export const createNotification = async (userId, type, message) => {
//   try {
//     await Notification.create({
//       userId,
//       type,    
//       message,
//     });
//   } catch (err) {
//     console.error("❌ Notification Error:", err);
//   }
// };


// // backend/utils/notify.js
// import Notification from "../models/Notification.js";

// export const createNotification = async (userId, type, message) => {
//   try {
//     // Prevent duplicates within last 2 hours
//     const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

//     const exists = await Notification.findOne({
//       user: userId,
//       type,
//       message,
//       createdAt: { $gte: twoHoursAgo }
//     });

//     if (exists) {
//       return; // Skip duplicate
//     }

//     const notif = await Notification.create({
//       user: userId,   // ✅ FIXED FIELD
//       type,
//       message,
//       isRead: false
//     });

//     return notif;
//   } catch (err) {
//     console.error("❌ Notification Error:", err);
//   }
// };


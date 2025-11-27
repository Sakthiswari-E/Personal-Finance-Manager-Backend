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

// import express from "express";
// import {
//   getNotifications,
//   markAsRead,
//   markAllAsRead,
//   deleteNotification,
//   deleteAllNotifications,
// } from "../controllers/notificationController.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// router.get("/", protect, getNotifications);
// router.patch("/:id/read", protect, markAsRead);
// router.patch("/mark-all", protect, markAllAsRead);
// router.delete("/:id", protect, deleteNotification);
// router.delete("/", protect, deleteAllNotifications);

// export default router;

// import express from "express";
// import { protect } from "../middleware/authMiddleware.js";

// import {
//   getNotifications,
//   markAsRead,
//   deleteNotification,
//   markAllAsRead,
// } from "../controllers/notificationController.js";

// const router = express.Router();

// router.get("/", protect, getNotifications);
// router.put("/:id/read", protect, markAsRead);
// router.put("/mark-all", protect, markAllAsRead);
// router.delete("/:id", protect, deleteNotification);

// export default router;

// import express from "express";
// import Notification from "../models/Notification.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();
// router.get("/test/run", (req, res) => {
//   res.send("✔ Notification routes are connected");
// });

// /* ----------------------------
//    GET all notifications  
// ---------------------------- */
// router.get("/", protect, async (req, res) => {
//   try {
//     const list = await Notification.find({ userId: req.user._id }).sort({
//       createdAt: -1,
//     });
//     res.json(list);
//   } catch (err) {
//     console.error("Get Notifications Error:", err);
//     res.status(500).json({ message: "Error fetching notifications" });
//   }
// });

// /* ----------------------------
//    MARK notification as read
// ---------------------------- */
// // router.put("/:id/read", protect, async (req, res) => {
// //   try {
// //     const n = await Notification.findById(req.params.id);

// //     if (!n) {
// //       return res.status(404).json({ message: "Notification not found" });
// //     }

// //     // Extra safety: only owner can update
// //     if (n.userId.toString() !== req.user._id.toString()) {
// //       return res.status(403).json({ message: "Not authorized" });
// //     }

// //     n.isRead = true;
// //     await n.save();

// //     res.json({ message: "Notification marked as read" });
// //   } catch (err) {
// //     console.error("Mark Read Error:", err);
// //     res.status(500).json({ message: "Error marking notification as read" });
// //   }
// // });

// router.put("/:id/read", protect, async (req, res) => {
//   try {
//     const n = await Notification.findById(req.params.id);

//     if (!n) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     if (n.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     n.isRead = true;
//     await n.save();

//     res.json({ message: "Notification marked as read" });
//   } catch (err) {
//     console.error("Mark Read Error:", err);
//     res.status(500).json({ message: "Error marking notification as read" });
//   }
// });

// /* ----------------------------
//    DELETE a notification
// ---------------------------- */
// // router.delete("/:id", protect, async (req, res) => {
// //   try {
// //     const n = await Notification.findById(req.params.id);
// //     const list = await Notification.find({ userId: req.user._id }).sort({
// //   createdAt: -1
// // });

// //     if (!n) {
// //       return res.status(404).json({ message: "Notification not found" });
// //     }

// //     // Ensure it belongs to the user
// //     // if (n.userId.toString() !== req.user._id.toString()) {
// //     //   return res.status(403).json({ message: "Not authorized" });
// //     // }
// //     if (n.userId.toString() !== req.user._id.toString()) {
// //       return res.status(403).json({ message: "Not authorized" });
// //     }

// //     await n.deleteOne();

// //     res.json({ message: "Notification deleted successfully" });
// //   } catch (err) {
// //     console.error("Delete Notification Error:", err);
// //     res.status(500).json({ message: "Failed to delete notification" });
// //   }
// // });
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const n = await Notification.findById(req.params.id);

//     if (!n) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     if (n.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await n.deleteOne();

//     res.json({ message: "Notification deleted successfully" });
//   } catch (err) {
//     console.error("Delete Notification Error:", err);
//     res.status(500).json({ message: "Failed to delete notification" });
//   }
// });

// export default router;




// import express from "express";
// import Notification from "../models/Notification.js";
// import { protect } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Test Route
// router.get("/test/run", (req, res) => {
//   res.send("✔ Notification routes are connected");
// });

// /* ----------------------------
//    GET all notifications  
// ---------------------------- */
// router.get("/", protect, async (req, res) => {
//   try {
//     const list = await Notification.find({ userId: req.user._id }).sort({
//       createdAt: -1,
//     });
//     res.json(list);
//   } catch (err) {
//     console.error("Get Notifications Error:", err);
//     res.status(500).json({ message: "Error fetching notifications" });
//   }
// });

// /* ----------------------------
//    MARK notification as read
// ---------------------------- */
// router.put("/:id/read", protect, async (req, res) => {
//   try {
//     const n = await Notification.findById(req.params.id);

//     if (!n) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     if (n.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     n.isRead = true;
//     await n.save();

//     res.json({ message: "Notification marked as read" });
//   } catch (err) {
//     console.error("Mark Read Error:", err);
//     res.status(500).json({ message: "Error marking notification as read" });
//   }
// });

// /* ----------------------------
//    DELETE a notification
// ---------------------------- */
// router.delete("/:id", protect, async (req, res) => {
//   try {
//     const n = await Notification.findById(req.params.id);

//     if (!n) {
//       return res.status(404).json({ message: "Notification not found" });
//     }

//     if (n.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     await n.deleteOne();

//     res.json({ message: "Notification deleted successfully" });
//   } catch (err) {
//     console.error("Delete Notification Error:", err);
//     res.status(500).json({ message: "Failed to delete notification" });
//   }
// });

// export default router;












// import express from "express";
// import { protect } from "../middleware/authMiddleware.js";

// import {
//   getNotifications,
//   markAsRead,
//   deleteNotification,
//   markAllAsRead,
// } from "../controllers/notificationController.js";

// const router = express.Router();

// router.get("/", protect, getNotifications);
// router.put("/:id/read", protect, markAsRead);
// router.put("/mark-all", protect, markAllAsRead);
// router.delete("/:id", protect, deleteNotification);

// export default router;

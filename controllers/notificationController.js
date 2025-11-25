// // backend/controllers/notificationController.js
// import Notification from "../models/Notification.js";

// export const getNotifications = async (req, res) => {
//   try {
//     const notifications = await Notification.find({ userId: req.user._id })
//       .sort({ createdAt: -1 })
//       .limit(20);
//     res.json(notifications);
//   } catch (err) {
//     res.status(500).json({ message: "Error fetching notifications" });
//   }
// };

// export const markAsRead = async (req, res) => {
//   try {
//     const notification = await Notification.findOneAndUpdate(
//       { _id: req.params.id, userId: req.user._id },
//       { isRead: true },
//       { new: true }
//     );
//     res.json(notification);
//   } catch (err) {
//     res.status(500).json({ message: "Error marking notification as read" });
//   }
// };

// export const deleteNotification = async (req, res) => {
//   try {
//     await Notification.deleteOne({ _id: req.params.id, userId: req.user._id });
//     res.json({ message: "Notification deleted" });
//   } catch (err) {
//     res.status(500).json({ message: "Failed to delete notification" });
//   }
// };








import Notification from "../models/Notification.js";

/* GET all notifications */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
};

/* Mark as read */
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: "Error marking notification as read" });
  }
};

/* Mark ALL as read */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error marking all as read" });
  }
};

/* Delete a single notification */
export const deleteNotification = async (req, res) => {
  try {
    await Notification.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    res.json({ message: "Notification deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete notification" });
  }
};

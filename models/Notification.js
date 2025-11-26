// models/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["budget", "bill", "goal", "general"],
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

export default mongoose.model("Notification", notificationSchema);

// //backend\models\Notification.js
// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["budget", "bill", "goal", "general"],
//     required: true,
//   },
//   message: { type: String, required: true },
//   isRead: { type: Boolean, default: false },
// }, { timestamps: true });

// export default mongoose.model("Notification", notificationSchema);













// import mongoose from "mongoose";

// const notificationSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   type: {
//     type: String,
//     enum: ["budget", "bill", "goal", "general"],
//     required: true,
//   },
//   message: { type: String, required: true },
//   isRead: { type: Boolean, default: false },
// }, { timestamps: true });

// export default mongoose.model("Notification", notificationSchema);

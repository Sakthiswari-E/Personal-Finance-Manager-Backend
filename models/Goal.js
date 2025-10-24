import mongoose from "mongoose";

const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    target: { type: Number, required: true, min: 0 },
    saved: { type: Number, default: 0, min: 0 },
    category: { type: String, trim: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Goal", goalSchema);

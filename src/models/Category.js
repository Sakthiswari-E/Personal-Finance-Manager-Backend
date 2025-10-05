const mongoose = require("mongoose");
const CategorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    color: { type: String },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Category", CategorySchema);

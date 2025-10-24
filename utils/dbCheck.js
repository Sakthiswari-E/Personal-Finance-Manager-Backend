// backend/utils/dbCheck.js
import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pfm";

  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connection successful");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1); // stop server if DB fails
  }
};

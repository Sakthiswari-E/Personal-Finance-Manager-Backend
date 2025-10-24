// clearUsers.js
import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";

dotenv.config();

async function clearUsers() {
  try {
    console.log("🧹 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("⚠️ Deleting all users...");
    const result = await User.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} user(s) from database.`);

    process.exit();
  } catch (err) {
    console.error("❌ Error deleting users:", err);
    process.exit(1);
  }
}

clearUsers();

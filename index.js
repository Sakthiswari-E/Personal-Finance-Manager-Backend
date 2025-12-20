// //backend\index.js
// import dotenv from "dotenv";
// dotenv.config();

// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import cookieParser from "cookie-parser";


// backend/index.js
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Routes
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import budgetRoutes from "./routes/budgets.js";
import reportRoutes from "./routes/reports.js";
import goalRoutes from "./routes/goals.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

import errorHandler from "./middleware/errorHandler.js";
import Settings from "./models/Settings.js";

// Start Notification Cron Jobs
import "./cron/notificationCron.js";
import "./cron/budgetNotificationCron.js";
import "./cron/goalNotificationCron.js";

const app = express();

// Environment Variables
const DEV_MODE = process.env.DEV_MODE === "true";
const PORT = process.env.PORT || 5002;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing. Check your .env file.");
  process.exit(1);
}


// Global Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://personal-finance-manager-frontend-3jfx.onrender.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Root Route
app.get("/", (req, res) => {
  res.send("✅ Personal Finance Manager API is running!");
});

// Helpful API Base
app.get("/api", (req, res) => {
  res.json({
    message: "✅ API is working. Try /api/auth/login or /api/expenses to continue."
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);

// Error Handler
app.use(errorHandler);

// Fix MongoDB index error
async function fixSettingsIndexes() {
  try {
    const indexes = await Settings.collection.getIndexes({ full: true });
    const hasBadIndex = indexes.some((i) => i.name === "user_1");

    if (hasBadIndex) {
      await Settings.collection.dropIndex("user_1");
      console.log("✅ Dropped invalid index user_1");
    }

    await Settings.syncIndexes();
    console.log("✅ Settings indexes synced");
  } catch (err) {
    console.error("⚠️ Index fix error:", err.message);
  }
}

// Start Server
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB connected");
    await fixSettingsIndexes();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import getPort from "get-port";

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

const app = express();

//  Environment Variables
const DEV_MODE = process.env.DEV_MODE === "true";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const DEFAULT_PORT = process.env.PORT || 5002;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/personal_finance_db";

//  Global Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Root route
app.get("/", (req, res) => {
  res.send("✅ Personal Finance Manager API is running!");
});

// Helpful API base route
app.get("/api", (req, res) => {
  res.json({
    message:
      "✅ API is working. Try /api/auth/login or /api/expenses to continue.",
  });
});

//  FIXED API ROUTES (now consistent ✅)
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/budgets", budgetRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/goals", goalRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/notifications", notificationRoutes);
//  Start Notification Cron Jobs
import "./cron/notificationCron.js";

//  Error Handler
app.use(errorHandler);

//  Fix MongoDB index issue
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

    const PORT = DEV_MODE
      ? DEFAULT_PORT
      : await getPort({ port: DEFAULT_PORT });

    app.listen(PORT, () =>
      console.log(`🚀 Server running → http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));

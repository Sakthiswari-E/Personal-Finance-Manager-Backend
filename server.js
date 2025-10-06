// Load environment variables first
import dotenv from "dotenv";
dotenv.config();

console.log(" ENV LOADED CHECK:");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? " Found" : " Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? " Found" : " Missing");
console.log(
  "JWT_REFRESH_SECRET:",
  process.env.JWT_REFRESH_SECRET ? " Found" : " Missing"
);

// Safety check — stop startup if critical variables missing
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Missing JWT secrets in .env file");
  process.exit(1);
}

if (!process.env.MONGO_URI) {
  console.error(" Missing MONGO_URI in .env file");
  process.exit(1);
}

import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import routes
import authRoutes from "./src/routes/auth.js";
import expensesRoutes from "./src/routes/expenses.js";
import budgetsRoutes from "./src/routes/budgets.js";
import transactionsRoutes from "./src/routes/transactions.js";
import goalsRoutes from "./src/routes/goals.js";
import forecastRoutes from "./src/routes/forecast.js";
import { initRecurring } from "./src/scheduler/recurringExpenses.js";
import exportRoutes from "./src/routes/export.js";
import profileRoutes from "./src/routes/profile.js";

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Updated CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://personalfinancemanager00.netlify.app",
  "https://68e3301de3edf238d871c43a--personalfinancemanager00.netlify.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/budgets", budgetsRoutes);
app.use("/api/transactions", transactionsRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/forecast", forecastRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/profile", profileRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("Personal Finance Manager API is running");
});

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(" MongoDB connected successfully");
    initRecurring();
    app.listen(PORT, () =>
      console.log(` Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error(" MongoDB connection error:", err.message);
    process.exit(1);
  });

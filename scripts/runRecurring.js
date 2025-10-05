// backend/scripts/runRecurring.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { runRecurringProcessing } from "../src/scheduler/recurringExpenses.js";

dotenv.config();

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await runRecurringProcessing();
    console.log("Manual run complete");
    process.exit(0);
  } catch (err) {
    console.error("Manual run error:", err);
    process.exit(1);
  }
})();

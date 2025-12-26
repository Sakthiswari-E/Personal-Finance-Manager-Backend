import express from "express";
import {
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
  incomeSummary,
  monthlyIncome,
} from "../controllers/incomeController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// PROTECTED ROUTES
router.get("/", protect, getIncome);
router.post("/", protect, addIncome);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

router.get("/summary", protect, incomeSummary);
router.get("/monthly", protect, monthlyIncome);

export default router;

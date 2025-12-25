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

router.get("/", getIncome);
router.post("/", addIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

router.get("/summary", incomeSummary);
router.get("/monthly", monthlyIncome);

export default router;

//Backend\routes\incomeRoutes.js
import express from "express";
import {
  getIncome,
  addIncome,
  updateIncome,
  deleteIncome,
  incomeSummary,
  monthlyIncome,
} from "../controllers/incomeController.js";
import auth from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", auth, getIncome);
router.post("/", auth, addIncome);
router.put("/:id", auth, updateIncome);
router.delete("/:id", auth, deleteIncome);

router.get("/summary", auth, incomeSummary);
router.get("/monthly", auth, monthlyIncome);

export default auth;

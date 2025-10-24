// backend/routes/auth.js
import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/logout", logout);

export default router;

import express from "express";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";

const router = express.Router();

// Refresh token endpoint
router.post("/refresh", (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Issue a new access token
    const newAccessToken = generateToken(decoded.id);

    return res.json({ success: true, token: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
});

export default router;

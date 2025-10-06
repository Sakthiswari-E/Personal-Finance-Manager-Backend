import express from "express";
import jwt from "jsonwebtoken";
import { generateToken, generateRefreshToken } from "../middleware/auth.js";

const router = express.Router();


router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;


    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      console.error(" Missing JWT_REFRESH_SECRET in environment variables");
      return res.status(500).json({
        success: false,
        message: "Server misconfiguration: missing refresh secret",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid refresh token payload",
      });
    }

    
    const newAccessToken = generateToken(decoded.id);
    const newRefreshToken = generateRefreshToken(decoded.id); 

    return res.status(200).json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken, 
      message: "Access token refreshed successfully",
    });
  } catch (err) {
    console.error(" Refresh token error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(403).json({
        success: false,
        message: "Refresh token expired. Please log in again.",
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid refresh token",
    });
  }
});

export default router;

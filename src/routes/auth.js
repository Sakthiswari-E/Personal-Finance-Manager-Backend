// Ensure .env variables are loaded before anything else
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

//  Safety checks
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
  console.error("Missing JWT secrets in .env file");
  process.exit(1);
}

/* REGISTER*/
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    user = new User({ name, email, password });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(" Register error:", err.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
});

/*LOGIN*/
router.post("/login", async (req, res) => {
  try {
    console.log(" Login request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log(" User not found:", email);
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log(" Invalid password for:", email);
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Tokens
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    console.log(" Login successful:", email);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(" Login error:", err.message);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
});

export default router;

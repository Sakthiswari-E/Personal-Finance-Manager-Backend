// backend/controllers/authController.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/* Generate JWT */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "changeme", {
    expiresIn: "7d",
  });
};

/* REGISTER */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
};

/* LOGIN */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

/* LOGOUT */
export const logout = (req, res) => {
  res.status(200).json({ message: "Logged out successfully" });
};

/* GET LOGGED IN USER */
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    res.status(500).json({ message: "Server error fetching user" });
  }
};

/* UPDATE PROFILE */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) user.password = req.body.password;

    const updated = await user.save();

    res.status(200).json({
      success: true,
      user: { id: updated._id, name: updated.name, email: updated.email },
    });
  } catch (err) {
    console.error("❌ Update error:", err);
    res.status(500).json({ message: "Error updating profile" });
  }
};

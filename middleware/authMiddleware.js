// backend/middleware/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    let token;

    console.log("🔍 Incoming Headers:", req.headers);
    console.log("🔍 Incoming Cookies:", req.cookies);

    // Check header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
      console.log("🔐 Token from Authorization header:", token);
    }

    // Check cookies
    else if (req.cookies?.token) {
      token = req.cookies.token;
      console.log("🔐 Token from Cookies:", token);
    }

    // No token at all
    if (!token) {
      console.log("❌ No token found in request");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // Verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    console.log("🔓 Decoded Token:", decoded);

    // Load user
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      console.log("❌ User not found in database for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }

    console.log("✅ Authenticated User:", req.user._id);

    next();
  } catch (err) {
    console.error("Auth error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

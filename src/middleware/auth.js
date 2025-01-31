const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    console.log("Auth middleware - token:", token);

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    console.log("Auth middleware - decoded token:", decoded);

    const user = await User.findById(decoded.userId);
    console.log("Auth middleware - found user:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Set both formats to support all functionality
    req.user = {
      _id: user._id, // For channels/rooms functionality
      userId: user._id, // For friends functionality
      email: user.email,
      username: user.username,
      // Add any other needed user fields
      friends: user.friends,
      status: user.status,
      // Keep the full user object as well
      ...user.toObject(), // Include all user fields
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;

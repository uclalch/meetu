const jwt = require("jsonwebtoken");
const config = require("../config/config");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        error: "No authentication token provided",
        code: "NO_TOKEN",
      });
    }

    try {
      const decoded = jwt.verify(token, config.JWT_SECRET);
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(401).json({
          error: "User not found",
          code: "USER_NOT_FOUND",
        });
      }

      // Update last seen
      user.lastSeen = new Date();
      await user.save();

      req.token = token;
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({
        error: "Invalid or expired token",
        code: "INVALID_TOKEN",
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      error: "Authentication error",
      code: "AUTH_ERROR",
    });
  }
};

module.exports = auth;

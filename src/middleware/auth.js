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

    req.user = {
      userId: user._id,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = auth;

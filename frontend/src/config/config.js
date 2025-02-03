const path = require("path");
require("dotenv").config({
  path: path.join(__dirname, "../companies_keys/MeetU/.env"),
});

// Generate a random JWT secret if not provided in environment
const generateJwtSecret = () => {
  const crypto = require("crypto");
  return crypto.randomBytes(32).toString("hex");
};

module.exports = {
  port: process.env.PORT || 3000,
  mongoURI: process.env.MONGODB_URI || "mongodb://mongodb:27017/meetu",
  jwtSecret: process.env.JWT_SECRET || generateJwtSecret(),
  tencentSecretId: process.env.TENCENT_SECRET_ID,
  tencentSecretKey: process.env.TENCENT_SECRET_KEY,
};

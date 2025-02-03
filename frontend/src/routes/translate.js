require("dotenv").config({ path: "../companies_keys/MeetU/.env" }); // Specify the path to your .env file
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const tencentcloud = require("tencentcloud-sdk-nodejs");

console.log("Translation router loaded"); // Debug log

// Check if environment variables are set
if (!process.env.TENCENT_SECRET_ID || !process.env.TENCENT_SECRET_KEY) {
  console.error("Tencent credentials not found in environment variables");
}

const TmtClient = tencentcloud.tmt.v20180321.Client;
const clientConfig = {
  credential: {
    secretId: process.env.TENCENT_SECRET_ID,
    secretKey: process.env.TENCENT_SECRET_KEY,
  },
  region: "ap-singapore",
  profile: {
    httpProfile: {
      endpoint: "tmt.tencentcloudapi.com",
    },
  },
};

// Create client instance
let client;
try {
  client = new TmtClient(clientConfig);
  console.log("Tencent translation client initialized");
} catch (error) {
  console.error("Failed to initialize Tencent client:", error);
}

router.post("/", auth, async (req, res) => {
  console.log("Translation request received:", req.body); // Debug log

  if (!client) {
    console.error("Translation client not initialized");
    return res.status(500).json({ error: "Translation service not available" });
  }

  try {
    const { text, targetLanguage = "en" } = req.body;
    console.log("Translation request:", { text, targetLanguage });

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    const params = {
      SourceText: text,
      Source: "auto",
      Target: targetLanguage,
      ProjectId: 0,
    };

    console.log("Calling Tencent API with params:", params); // Debug log
    const result = await client.TextTranslate(params);
    console.log("Translation result:", result);

    if (!result || !result.TargetText) {
      throw new Error("Invalid translation response");
    }

    res.json({ translatedText: result.TargetText });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({
      error: "Translation failed",
      details: error.message,
    });
  }
});

module.exports = router;

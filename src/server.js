require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const socketIO = require("socket.io");
const authRoutes = require("./routes/auth");
const {
  translateText,
  detectLanguage,
} = require("./services/translationService");
const channelsRouter = require("./routes/channels");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (data) => {
    socket.join(data.channel);
    console.log(`${data.username} joined ${data.channel}`);
  });

  socket.on("chat-message", async (message) => {
    try {
      // Detect language before broadcasting
      const detectedLanguage = await detectLanguage(message.content);
      message.language = detectedLanguage;

      console.log("Detected language:", {
        text: message.content,
        language: detectedLanguage,
      });

      io.to(message.channel).emit("chat-message", message);
    } catch (error) {
      console.error("Language detection error:", error);
      // If detection fails, still send message but with undefined language
      io.to(message.channel).emit("chat-message", message);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });

  socket.on("translate-message", async (data, callback) => {
    try {
      const translatedText = await translateText(data.text, data.from, data.to);
      callback({ text: translatedText });
    } catch (error) {
      console.error("Translation error:", error);
      callback({ error: "Translation service unavailable" });
    }
  });
});

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/chat.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/register.html"));
});

app.use("/api/auth", authRoutes);
app.use("/api/channels", channelsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = server;

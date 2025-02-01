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
const translateRouter = require("./routes/translate");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Make io accessible to routes
app.set("io", io);

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
  console.log("New client connected:", socket.id);

  const userId = socket.handshake.auth.userId;
  console.log("User connected:", userId);

  // Store the socket id for the user
  if (userId) {
    socket.join(userId);
  }

  // Room chat handling
  socket.on("join", (data) => {
    console.log("Join event:", data);
    if (data.roomId) {
      socket.join(data.roomId);
      // Notify room about new user
      io.to(data.roomId).emit("user-joined", {
        username: data.username,
        userId: data.userId,
      });
    }
  });

  // Room message handling
  socket.on("room-message", (data) => {
    console.log("Room message:", data);
    if (data.room) {
      // Remove this line as the message is already emitted from the route handler
      // io.to(data.room).emit("room-message", data.message);
    }
  });

  // Private message handling
  socket.on("private-message", (data) => {
    console.log("Server received private message:", data);
    if (data.recipientId) {
      // io.to(data.recipientId).emit("private-message", data);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
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
const friendsRoutes = require("./routes/friends");
app.use("/api/friends", friendsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/channels", channelsRouter);
app.use("/api/translate", translateRouter);

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

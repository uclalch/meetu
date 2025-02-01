// ... existing requires ...
const roomRoutes = require("./routes/room");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const channelsRouter = require("./routes/channels");
const User = require("./models/User");
const friendsRouter = require("./routes/friends");
const auth = require("./middleware/auth");
const translateRouter = require("./routes/translate");
const authRouter = require("./routes/auth");
const messagesRouter = require("./routes/messages");
// Store io instance in app
app.set("io", io);

// Debug middleware - add this before any routes
app.use((req, res, next) => {
  console.log("Main app request:", {
    method: req.method,
    path: req.path,
    headers: req.headers,
  });
  next();
});
// Your middleware
app.use(express.json());
app.use(express.static("public"));
app.use(cors());

// Your existing socket.io connection handler
io.on("connection", (socket) => {
  console.log("User connected to socket");

  socket.on("join", (data) => {
    console.log("User joined room:", data);
    socket.join(data.roomId);
  });

  // Add this new event handler
  socket.on("channel deleted", (channelId) => {
    console.log("Broadcasting channel deletion:", channelId);
    io.emit("channel deleted", channelId);
  });

  // ... your other socket events ...
});

// ... existing middleware ...

// Add the room routes
app.use("/api/rooms", roomRoutes);

// Add the channels routes
app.use("/api/channels", channelsRouter);

// Add this with your other app.use statements
app.use("/api/friends", friendsRouter);

// Add this with your other route registrations
app.use("/api/translate", translateRouter);

// Add this line
app.use("/api/auth", authRouter);
app.use("/api/messages", messagesRouter);

// Log registered routes
console.log("=== Registered Routes ===");
app._router.stack.forEach((layer) => {
  if (layer.name === "router") {
    console.log("Router:", layer.regexp);
  } else if (layer.route) {
    console.log(`${Object.keys(layer.route.methods)} ${layer.route.path}`);
  }
});

// Export both app and server
module.exports = { app, server };

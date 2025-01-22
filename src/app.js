// ... existing requires ...
const roomRoutes = require("./routes/room");
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);

// Store io instance in app
app.set("io", io);

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

// ... rest of your app.js code ...

// Export both app and server
module.exports = { app, server };

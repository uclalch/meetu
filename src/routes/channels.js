const express = require("express");
const router = express.Router();
const Channel = require("../models/Channel");
const auth = require("../middleware/auth");
const mongoose = require("mongoose");

// Create new channel
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ error: "Channel name is required" });
    }

    const channel = new Channel({
      name,
      description: description || "",
      isPublic: isPublic !== false, // defaults to true if not specified
      owner: req.user._id,
      members: [req.user._id],
      server: "default",
    });

    await channel.save();

    // Populate owner details before sending response
    await channel.populate("owner", "username");

    console.log("Channel created:", channel); // Debug log
    res.status(201).json(channel);
  } catch (error) {
    console.error("Channel creation error:", error);
    res.status(500).json({ error: "Failed to create channel" });
  }
});

// Get user's channels - show rooms user owns or is a member of
router.get("/my", auth, async (req, res) => {
  try {
    const channels = await Channel.find({
      $or: [
        { owner: req.user._id }, // Rooms user owns
        { members: req.user._id }, // Rooms user is a member of
      ],
    })
      .populate("owner", "username")
      .sort({ createdAt: -1 });
    res.json(channels);
  } catch (error) {
    console.error("Error fetching user channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Get public channels - show only public rooms user is NOT a member of
router.get("/public", auth, async (req, res) => {
  try {
    const channels = await Channel.find({
      isPublic: true,
      members: { $ne: req.user._id }, // Keep this filter to exclude rooms user is in
      owner: { $ne: req.user._id }, // Also exclude rooms user owns
    })
      .populate("owner", "username")
      .sort({ createdAt: -1 });
    res.json(channels);
  } catch (error) {
    console.error("Error fetching public channels:", error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// Join channel
router.post("/:id/join", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    if (!channel.isPublic) {
      return res.status(403).json({ error: "Cannot join private channel" });
    }

    // Add user to members if not already a member
    if (!channel.members.includes(req.user._id)) {
      channel.members.push(req.user._id);
      await channel.save();
    }

    await channel.populate("owner", "username");
    res.json(channel);
  } catch (error) {
    console.error("Error joining channel:", error);
    res.status(500).json({ error: "Failed to join channel" });
  }
});

// Delete channel
router.delete("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid channel ID format" });
    }

    console.log("Delete request for channel:", req.params.id);
    console.log("User making request:", req.user._id);

    const channel = await Channel.findById(req.params.id);
    console.log("Found channel:", channel);

    if (!channel) {
      console.log("Channel not found");
      return res.status(404).json({ error: "Channel not found" });
    }

    // Debug ownership check
    console.log("Channel owner:", channel.owner.toString());
    console.log("Current user:", req.user._id.toString());
    console.log(
      "Is owner?",
      channel.owner.toString() === req.user._id.toString()
    );

    // Check if the current user is the owner
    if (channel.owner.toString() !== req.user._id.toString()) {
      console.log("User is not the owner");
      return res
        .status(403)
        .json({ error: "Only the channel owner can delete the channel" });
    }

    const deletedChannel = await Channel.findByIdAndDelete(req.params.id);
    console.log("Channel deleted:", deletedChannel);

    // Check if socket.io is available
    const io = req.app.get("io");
    if (io) {
      console.log("Emitting channel deleted event");
      io.emit("channel deleted", channel._id);
    } else {
      console.log("Socket.io not initialized");
    }

    res.json({ message: "Channel deleted successfully" });
  } catch (error) {
    console.error("Detailed error:", error);
    res.status(500).json({
      error: "Failed to delete channel",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
});

// Add or update the leave channel route
router.post("/:id/leave", auth, async (req, res) => {
  try {
    console.log("Leave request for channel:", req.params.id);
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    // Can't leave if you're the owner
    if (channel.owner.toString() === req.user._id.toString()) {
      return res.status(403).json({
        error: "Channel owner cannot leave. Delete the channel instead.",
      });
    }

    console.log("Current members:", channel.members);
    console.log("User trying to leave:", req.user._id);

    // Remove user from members array
    channel.members = channel.members.filter(
      (memberId) => memberId.toString() !== req.user._id.toString()
    );

    console.log("Members after removal:", channel.members);

    await channel.save();

    // Populate owner info before sending response
    await channel.populate("owner", "username");

    res.json({
      message: "Left channel successfully",
      channel: channel,
    });
  } catch (error) {
    console.error("Error leaving channel:", error);
    res.status(500).json({
      error: "Failed to leave channel",
      details: error.message,
    });
  }
});

// Add this new route to check if a channel exists
router.get("/:id/check", auth, async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json({ exists: true });
  } catch (error) {
    console.error("Error checking channel:", error);
    res.status(500).json({ error: "Failed to check channel status" });
  }
});

// Get a specific channel
router.get("/:channelId", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.channelId)) {
      return res.status(400).json({ error: "Invalid channel ID format" });
    }

    const channel = await Channel.findById(req.params.channelId)
      .populate("owner", "username")
      .populate("members", "username");

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json(channel);
  } catch (error) {
    console.error("Error getting channel:", error);
    res.status(500).json({ error: "Failed to get channel details" });
  }
});

module.exports = router;

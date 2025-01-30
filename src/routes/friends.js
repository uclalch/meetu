const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

console.log("Friends router initialized");

// Debug middleware for friends routes
router.use((req, res, next) => {
  console.log("Friends route hit:", {
    method: req.method,
    path: req.path,
  });
  next();
});

// Add friend route
router.post("/add", auth, async (req, res) => {
  console.log("Adding friend route handler executing");
  try {
    const { email } = req.body;
    console.log("Adding friend with email:", email);

    // Find the friend by email
    const friend = await User.findOne({ email });
    if (!friend) {
      return res.status(404).json({ error: "User not found" });
    }

    // Find the current user
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: "Current user not found" });
    }

    // Initialize friends array if it doesn't exist
    if (!user.friends) {
      user.friends = [];
    }

    // Check if already friends
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Add friend to user's friends list
    user.friends.push(friend._id);
    await user.save();

    console.log("Friend added successfully");
    res.json({ message: "Friend added successfully" });
  } catch (error) {
    console.error("Error adding friend:", error);
    res.status(500).json({ error: "Failed to add friend" });
  }
});

// Add this route to get user's friends
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "friends",
      "username email status"
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user.friends || []);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Send friend request
router.post("/request", auth, async (req, res) => {
  try {
    const { email } = req.body;

    // Find the recipient
    const recipient = await User.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if request already exists
    const existingRequest = recipient.friendRequests.find(
      (req) => req.from.toString() === req.user.userId
    );
    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already sent" });
    }

    // Add friend request
    recipient.friendRequests.push({
      from: req.user.userId,
      status: "pending",
    });
    await recipient.save();

    res.json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Get friend requests
router.get("/requests", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).populate(
      "friendRequests.from",
      "username email"
    );

    const pendingRequests = user.friendRequests.filter(
      (req) => req.status === "pending"
    );
    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching friend requests:", error);
    res.status(500).json({ error: "Failed to fetch friend requests" });
  }
});

// Accept/Reject friend request
router.post("/request/:requestId/respond", auth, async (req, res) => {
  try {
    const { accept } = req.body;
    const user = await User.findById(req.user.userId);

    const request = user.friendRequests.id(req.params.requestId);
    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    if (accept) {
      // Add to friends lists
      user.friends.push(request.from);
      const friend = await User.findById(request.from);
      friend.friends.push(user._id);

      // Save both users
      await Promise.all([user.save(), friend.save()]);

      request.status = "accepted";
    } else {
      request.status = "rejected";
    }

    await user.save();
    res.json({ message: `Friend request ${accept ? "accepted" : "rejected"}` });
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ error: "Failed to respond to friend request" });
  }
});

module.exports = router;

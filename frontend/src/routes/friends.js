const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const user = require("../models/User");
const FriendRequest = require("../models/friendRequest");

// Send friend request
router.post("/request", auth, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const senderId = req.user._id;
    if (!senderId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if user is trying to add themselves
    if (req.user.email === email) {
      return res
        .status(400)
        .json({ error: "Cannot send friend request to yourself" });
    }

    // Find user by email
    const recipient = await user.findOne({ email });
    if (!recipient) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if users are already friends
    if (recipient.friends.includes(senderId)) {
      return res.status(400).json({ error: "Already friends with this user" });
    }

    // Check if request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, recipient: recipient._id },
        { sender: recipient._id, recipient: senderId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ error: "Friend request already exists" });
    }

    // Create new friend request
    const friendRequest = new FriendRequest({
      sender: senderId,
      recipient: recipient._id,
      status: "pending",
    });

    await friendRequest.save();
    res.status(201).json({ message: "Friend request sent successfully" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Get all friend requests (both sent and received)
router.get("/requests/all", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const requests = await FriendRequest.find({
      $or: [{ sender: userId }, { recipient: userId }],
      status: "pending",
    }).populate("sender recipient", "username email");

    res.json(requests);
  } catch (error) {
    console.error("Error getting all friend requests:", error);
    res.status(500).json({ error: "Failed to get friend requests" });
  }
});

// Accept/Reject friend request
router.put("/request/:requestId", auth, async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // 'accepted' or 'rejected'

    const request = await FriendRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ error: "Friend request not found" });
    }

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Not authorized" });
    }

    request.status = status;
    await request.save();

    if (status === "accepted") {
      // Add users to each other's friend lists using $addToSet
      const [senderUpdate, recipientUpdate] = await Promise.all([
        user.findByIdAndUpdate(
          request.sender,
          { $addToSet: { friends: request.recipient } },
          { new: true }
        ),
        user.findByIdAndUpdate(
          request.recipient,
          { $addToSet: { friends: request.sender } },
          { new: true }
        ),
      ]);

      console.log("Friend updates:", {
        senderFriends: senderUpdate.friends,
        recipientFriends: recipientUpdate.friends,
      });
    }

    res.json(request);
  } catch (error) {
    console.error("Error updating friend request:", error);
    res.status(500).json({ error: "Failed to update friend request" });
  }
});

// Delete friend
router.delete("/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;
    const userId = req.user._id;

    // Remove friend from user's friends list
    await user.findByIdAndUpdate(userId, {
      $pull: { friends: friendId },
    });

    // Remove user from friend's friends list
    await user.findByIdAndUpdate(friendId, {
      $pull: { friends: userId },
    });

    res.status(200).json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    res.status(500).json({ error: "Failed to delete friend" });
  }
});

// Get friends list
router.get("/", auth, async (req, res) => {
  try {
    console.log("Getting friends for user:", req.user._id);

    const currentUser = await user
      .findById(req.user._id)
      .populate("friends", "username email status");

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("User's friends:", currentUser.friends);
    res.json(currentUser.friends);
  } catch (error) {
    console.error("Error getting friends list:", error);
    res.status(500).json({ error: "Failed to get friends list" });
  }
});

module.exports = router;

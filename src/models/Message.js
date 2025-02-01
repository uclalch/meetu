const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        return this.type === "private";
      },
    },
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: function () {
        return this.type === "channel";
      },
    },
    type: {
      type: String,
      enum: ["channel", "private"],
      default: "channel",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);

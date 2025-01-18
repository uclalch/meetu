const mongoose = require("mongoose");
const crypto = require("crypto");

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    hash: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    server: {
      type: String,
      default: "default",
    },
  },
  {
    timestamps: true,
  }
);

// Generate hash before validation (not save)
channelSchema.pre("validate", function (next) {
  if (!this.hash) {
    this.hash = crypto.randomBytes(4).toString("hex");
  }
  next();
});

const Channel = mongoose.model("Channel", channelSchema);

module.exports = Channel;

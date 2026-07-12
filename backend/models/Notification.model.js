const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // User receiving the notification
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Notification Type
    type: {
      type: String,
      enum: [
        "match",
        "message",
        "report_update",
        "fraud_alert",
        "system",
      ],
      required: true,
    },

    // Notification Title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // Notification Body
    body: {
      type: String,
      required: true,
      trim: true,
    },

    // Read Status
    isRead: {
      type: Boolean,
      default: false,
    },

    // Time notification was read
    readAt: {
      type: Date,
      default: null,
    },

    // Related Report
    relatedReport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      default: null,
    },

    // Related Match
    relatedMatch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      default: null,
    },

    // Related Conversation
    relatedConversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);
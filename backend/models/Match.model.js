const mongoose = require("mongoose");

const matchSchema = new mongoose.Schema(
  {
    // Lost Report
    lostReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    // Found Report
    foundReportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
      required: true,
    },

    // Overall Confidence Score
    confidenceScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // How the match was generated
    matchType: {
      type: String,
      enum: ["AI", "manual", "admin"],
      default: "AI",
    },

    // Match Status
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
      ],
      default: "pending",
    },

    // User that accepted the match
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // User that rejected the match
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Similarity Breakdown
    similarityBreakdown: {
      title: {
        type: Number,
        default: 0,
      },

      category: {
        type: Number,
        default: 0,
      },

      brand: {
        type: Number,
        default: 0,
      },

      model: {
        type: Number,
        default: 0,
      },

      color: {
        type: Number,
        default: 0,
      },

      location: {
        type: Number,
        default: 0,
      },

      date: {
        type: Number,
        default: 0,
      },

      markings: {
        type: Number,
        default: 0,
      },
    },

    // AI Analysis
    aiAnalysisNote: {
      type: String,
      default: "",
    },

    // Fraud Flag
    flaggedAsFraud: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate matches
matchSchema.index(
  {
    lostReportId: 1,
    foundReportId: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Match", matchSchema);
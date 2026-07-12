const Match = require("../../models/Match.model");
const { createNotification } = require("../../services/notification.service");


module.exports = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("lostReportId")
      .populate("foundReportId");

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    // Only owner of either report can reject
    const isLostOwner = String(match.lostReportId.userId) === String(req.user.id);
    const isFoundOwner = String(match.foundReportId.userId) === String(req.user.id);

    if (!isLostOwner && !isFoundOwner) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Can only reject a pending match
    if (match.status !== "pending") {
      return res.status(400).json({
        message: `Match is already ${match.status}.`,
      });
    }

    match.status = "rejected";
    match.rejectedBy = req.user.id;
    await match.save();

    const otherUserId =
      String(match.lostReportId.userId) === String(req.user.id)
        ? match.foundReportId.userId
        : match.lostReportId.userId;

    // Notify the other user
    await createNotification({
      userId: otherUserId,
      type: "match",
      title: "Match Rejected",
      body: "Your match has been rejected. Keep checking for new matches.",
      relatedMatch: match._id,
    });

    res.json({ message: "Match rejected.", match });
  } catch (err) {
    console.error("Reject match error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
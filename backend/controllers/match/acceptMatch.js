const Match = require("../../models/Match.model");
const Report = require("../../models/Report.model");
const { createNotification } = require("../../services/notification.service");


module.exports = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("lostReportId")
      .populate("foundReportId");

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    // Only owner of either report can accept
    const isLostOwner = String(match.lostReportId.userId) === String(req.user.id);
    const isFoundOwner = String(match.foundReportId.userId) === String(req.user.id);

    if (!isLostOwner && !isFoundOwner) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Can only accept a pending match
    if (match.status !== "pending") {
      return res.status(400).json({
        message: `Match is already ${match.status}.`,
      });
    }

    // Update match
    match.status = "accepted";
    match.acceptedBy = req.user.id;
    await match.save();

    const otherUserId =
      String(match.lostReportId.userId) === String(req.user.id)
        ? match.foundReportId.userId
        : match.lostReportId.userId;

    // Notify the other user
    await createNotification({
      userId: otherUserId,
      type: "match",
      title: "Match Accepted",
      body: "Your match has been accepted. You can now start a conversation.",
      relatedMatch: match._id,
    });

    // Mark both reports as matched
    await Report.findByIdAndUpdate(match.lostReportId._id, { status: "matched" });
    await Report.findByIdAndUpdate(match.foundReportId._id, { status: "matched" });

    res.json({ message: "Match accepted successfully.", match });
  } catch (err) {
    console.error("Accept match error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
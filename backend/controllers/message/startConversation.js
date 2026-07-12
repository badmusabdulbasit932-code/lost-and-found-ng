const Conversation = require("../../models/Conversation.model");
const Match = require("../../models/Match.model");

module.exports = async (req, res) => {
    try {
        const { matchId } = req.body;

        if (!matchId) {
            return res.status(400).json({ message: "matchId is required." });
        }

        // Find the match
        const match = await Match.findById(matchId)
            .populate("lostReportId")
            .populate("foundReportId");

        if (!match) {
            return res.status(404).json({ message: "Match not found." });
        }

        // Only accepted matches can have conversations
        if (match.status !== "accepted") {
            return res.status(400).json({
                message: "Conversation can only be started on an accepted match.",
            });
        }

        // Only owners of either report can start a conversation
        const isLostOwner = String(match.lostReportId.userId) === String(req.user.id);
        const isFoundOwner = String(match.foundReportId.userId) === String(req.user.id);

        if (!isLostOwner && !isFoundOwner) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Check if conversation already exists for this match
        const existing = await Conversation.findOne({ matchId });
        if (existing) {
            return res.json({
                message: "Conversation already exists.",
                conversation: existing,
            });
        }

        // Build participants array from both report owners
        const participants = [
            match.lostReportId.userId,
            match.foundReportId.userId,
        ];

        // Create the conversation
        const conversation = await Conversation.create({
            participants,
            reportId: match.lostReportId._id,
            matchId,
        });

        res.status(201).json({
            message: "Conversation started successfully.",
            conversation,
        });
    } catch (err) {
        console.error("Start conversation error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
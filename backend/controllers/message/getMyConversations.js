const Conversation = require("../../models/Conversation.model");

module.exports = async (req, res) => {
    try {
        // Find all conversations where user is a participant
        const conversations = await Conversation.find({
            participants: req.user.id,
            status: { $ne: "blocked" },
        })
            .populate("participants", "name avatar")
            .populate("reportId", "title type images")
            .populate("matchId", "confidenceScore status")
            .populate("lastMessage", "text attachments createdAt senderId")
            .sort({ lastMessageAt: -1 });

        res.json({
            total: conversations.length,
            conversations,
        });
    } catch (err) {
        console.error("Get conversations error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
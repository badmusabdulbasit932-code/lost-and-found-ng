const Message = require("../../models/Message.model");
const Conversation = require("../../models/Conversation.model");

module.exports = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { page = 1, limit = 30 } = req.query;

        // Find the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Only participants can read messages
        const isParticipant = conversation.participants
            .map(String)
            .includes(String(req.user.id));

        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized." });
        }

        const skip = (Number(page) - 1) * Number(limit);
        const total = await Message.countDocuments({
            conversationId,
            deletedForEveryone: false,
        });

        // Get messages — oldest first for chat display
        const messages = await Message.find({
            conversationId,
            deletedForEveryone: false,
        })
            .populate("senderId", "name avatar")
            .populate("receiverId", "name avatar")
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(Number(limit));

        // Mark unread messages as read
        await Message.updateMany(
            {
                conversationId,
                receiverId: req.user.id,
                isRead: false,
            },
            {
                isRead: true,
                readAt: new Date(),
            }
        );

        res.json({
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)),
            messages,
        });
    } catch (err) {
        console.error("Get messages error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
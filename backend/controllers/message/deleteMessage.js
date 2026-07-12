const Message = require("../../models/Message.model");

const DELETE_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

module.exports = async (req, res) => {
    try {
        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // Only sender can delete for everyone
        if (String(message.senderId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Cannot delete already deleted message
        if (message.deletedForEveryone) {
            return res.status(400).json({ message: "Message already deleted." });
        }

        // Deleting window has closed
        if (Date.now() - new Date(message.createdAt).getTime() > DELETE_WINDOW_MS) {
            return res.status(400).json({ message: "This message can no longer be deleted (15-minute window has passed)." });
        }

        message.deletedForEveryone = true;
        message.deletedAt = new Date();
        message.text = "";
        message.attachments = [];
        await message.save();

        res.json({ message: "Message deleted successfully." });
    } catch (err) {
        console.error("Delete message error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
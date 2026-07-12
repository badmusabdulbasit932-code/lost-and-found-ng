const Message = require("../../models/Message.model");

const EDIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

module.exports = async (req, res) => {
    try {
        const { text } = req.body;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ message: "Text is required." });
        }

        const message = await Message.findById(req.params.messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found." });
        }

        // Only sender can edit
        if (String(message.senderId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Cannot edit a deleted message
        if (message.deletedForEveryone) {
            return res.status(400).json({ message: "Cannot edit a deleted message." });
        }

        // Cannot edit system messages
        if (message.isSystemMessage) {
            return res.status(400).json({ message: "Cannot edit a system message." });
        }

        // Editing window has closed
        if (Date.now() - new Date(message.createdAt).getTime() > EDIT_WINDOW_MS) {
            return res.status(400).json({ message: "This message can no longer be edited (15-minute window has passed)." });
        }

        message.text = text.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        res.json({ message: "Message edited successfully.", data: message });
    } catch (err) {
        console.error("Edit message error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
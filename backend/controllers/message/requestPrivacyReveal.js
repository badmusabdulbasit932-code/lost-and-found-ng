// Import Conversation model
const Conversation = require("../../models/Conversation.model");

module.exports = async (req, res) => {
    try {
        // Find the conversation by ID from the URL
        const conversation = await Conversation.findById(req.params.conversationId);

        // Check if it exists
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Check if the logged-in user is a participant
        const isParticipant = conversation.participants
            .map(String)
            .includes(String(req.user.id));

        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Check if privacy is already revealed
        if (conversation.isPrivacyRevealed) {
            return res.status(400).json({
                message: "Privacy already revealed for this conversation.",
            });
        }

        // Check if a request already exists
        if (conversation.revealRequestedBy) {
            return res.status(400).json({
                message: "Privacy reveal already requested. Waiting for the other user to accept.",
            });
        }

        // Save who made the request
        conversation.revealRequestedBy = req.user.id;
        await conversation.save();

        // Send the response
        res.json({
            message: "Privacy reveal requested. Waiting for the other user to accept.",
            conversation,
        });

    } catch (err) {
        console.error("Request privacy reveal error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
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

        // There must be a pending request to accept
        if (!conversation.revealRequestedBy) {
            return res.status(400).json({
                message: "No privacy reveal request found.",
            });
        }

        // The person who requested cannot accept their own request
        if (String(conversation.revealRequestedBy) === String(req.user.id)) {
            return res.status(400).json({
                message: "You cannot accept your own privacy reveal request.",
            });
        }

        // Already revealed
        if (conversation.isPrivacyRevealed) {
            return res.status(400).json({
                message: "Privacy already revealed.",
            });
        }

        // Mark privacy as revealed
        conversation.isPrivacyRevealed = true;
        await conversation.save();

        // Send the response
        res.json({
            message: "Privacy revealed. Both users can now see each other's contact info.",
            conversation,
        });

    } catch (err) {
        console.error("Accept privacy reveal error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
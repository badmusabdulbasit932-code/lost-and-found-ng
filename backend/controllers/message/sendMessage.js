const Message = require("../../models/Message.model");
const Conversation = require("../../models/Conversation.model");
const { createNotification } = require("../../services/notification.service");


module.exports = async (req, res) => {
    try {
        const { conversationId } = req.params;
        const { text } = req.body;

        // Must have text or attachment
        const hasText = text && text.trim().length > 0;
        const hasAttachment = req.files && req.files.length > 0;

        if (!hasText && !hasAttachment) {
            return res.status(400).json({
                message: "Message must have text or an attachment.",
            });
        }

        // Find the conversation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found." });
        }

        // Only participants can send messages
        const isParticipant = conversation.participants
            .map(String)
            .includes(String(req.user.id));

        if (!isParticipant) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Cannot send messages in a closed or blocked conversation
        if (conversation.status !== "active") {
            return res.status(400).json({
                message: `Cannot send messages in a ${conversation.status} conversation.`,
            });
        }

        // Find the receiver — the other participant
        const receiverId = conversation.participants.find(
            (p) => String(p) !== String(req.user.id)
        );

        // Upload attachments to Cloudinary if any
        const attachments = [];
        if (hasAttachment) {
            const { uploadToCloudinary } = require("../../config/cloudinary");
            for (const file of req.files) {
                const result = await uploadToCloudinary(file.buffer, "lostfound_ng/messages");
                attachments.push(result.secure_url);
            }
        }

        // Create the message
        const message = await Message.create({
            conversationId,
            senderId: req.user.id,
            receiverId,
            text: text ? text.trim() : "",
            attachments,
        });

        // Update conversation's lastMessage and lastMessageAt
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        await conversation.save();

        await createNotification({
            userId: receiverId,
            type: "message",
            title: "New Message",
            body: "You have a new message.",
            relatedConversation: conversation._id,
        });

        res.status(201).json({
            message: "Message sent successfully.",
            data: message,
        });
    } catch (err) {
        console.error("Send message error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
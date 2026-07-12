// Import the Notification model
const Notification = require("../../models/Notification.model");

module.exports = async (req, res) => {
    try {
        // Find the notification by the ID in the URL
        const notification = await Notification.findById(req.params.id);

        // Check if it exists
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        // Make sure this notification belongs to the logged-in user
        // Users should not be able to mark other people's notifications as read
        if (String(notification.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Check if it is already read
        // No need to update if it is already read
        if (notification.isRead) {
            return res.json({
                message: "Notification already read.",
                notification,
            });
        }

        // Mark as read and record the time
        notification.isRead = true;
        notification.readAt = new Date();

        // Save the changes
        await notification.save();

        // Send the response
        res.json({
            message: "Notification marked as read.",
            notification,
        });

    } catch (err) {
        console.error("Mark as read error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
// Import the Notification model
const Notification = require("../../models/Notification.model");

module.exports = async (req, res) => {
    try {
        // Update ALL unread notifications for this user at once
        // updateMany updates multiple documents in one database call
        const result = await Notification.updateMany(
            {
                // Filter — only this user's unread notifications
                userId: req.user.id,
                isRead: false,
            },
            {
                // What to update
                isRead: true,
                readAt: new Date(),
            }
        );

        // result.modifiedCount tells us how many were updated
        res.json({
            message: `${result.modifiedCount} notifications marked as read.`,
        });

    } catch (err) {
        console.error("Mark all as read error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
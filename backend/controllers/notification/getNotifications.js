// Import the Notification model
const Notification = require("../../models/Notification.model");

module.exports = async (req, res) => {
    try {
        // Get page and limit from query params
        // Default to page 1 and 20 notifications per page
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;

        // Calculate how many to skip for pagination
        const skip = (page - 1) * limit;

        // Count total notifications for this user
        const total = await Notification.countDocuments({
            userId: req.user.id,
        });

        // Count only unread notifications
        // This is what shows on the bell icon badge
        const unreadCount = await Notification.countDocuments({
            userId: req.user.id,
            isRead: false,
        });

        // Get the notifications for this user
        // Newest first so most recent notifications appear at the top
        const notifications = await Notification.find({
            userId: req.user.id,
        })
            .populate("relatedReport", "title type")
            .populate("relatedMatch", "confidenceScore status")
            .populate("relatedConversation", "status")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Send the response
        res.json({
            total,
            unreadCount,
            page,
            totalPages: Math.ceil(total / limit),
            notifications,
        });

    } catch (err) {
        console.error("Get notifications error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
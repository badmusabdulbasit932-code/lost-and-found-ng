// Import the Notification model
const Notification = require("../../models/Notification.model");

module.exports = async (req, res) => {
    try {
        // Find the notification by ID
        const notification = await Notification.findById(req.params.id);

        // Check if it exists
        if (!notification) {
            return res.status(404).json({ message: "Notification not found." });
        }

        // Make sure it belongs to the logged-in user
        if (String(notification.userId) !== String(req.user.id)) {
            return res.status(403).json({ message: "Not authorized." });
        }

        // Delete the notification permanently
        // Notifications are small and not referenced by anything else
        // so hard delete is fine here
        await Notification.findByIdAndDelete(req.params.id);

        // Send the response
        res.json({ message: "Notification deleted." });

    } catch (err) {
        console.error("Delete notification error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
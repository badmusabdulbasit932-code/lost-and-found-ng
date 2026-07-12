// Import the Notification model
const Notification = require("../models/Notification.model");

// This is a helper function we call from other controllers
// whenever we want to create a notification
// We never call this directly from a route

const createNotification = async ({
    userId,
    type,
    title,
    body,
    relatedReport = null,
    relatedMatch = null,
    relatedConversation = null,
}) => {
    try {
        // Create the notification document in MongoDB
        const notification = await Notification.create({
            userId,
            type,
            title,
            body,
            relatedReport,
            relatedMatch,
            relatedConversation,
        });

        // Return it in case the caller needs it
        return notification;

    } catch (err) {
        // We don't throw the error because notifications
        // should never crash the main action
        // For example if a match is accepted but notification fails
        // the match should still be accepted successfully
        console.error("Create notification error:", err.message);
    }
};

// Export the helper so other files can use it
module.exports = { createNotification };
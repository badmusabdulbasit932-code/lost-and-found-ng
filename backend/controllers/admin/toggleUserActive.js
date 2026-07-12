// Import the User model
const User = require("../../models/user.model");

// Import notification service
const { createNotification } = require("../../services/notification.service");

module.exports = async (req, res) => {
    try {
        // Find the user by ID
        const user = await User.findById(req.params.id);

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Prevent admin from deactivating their own account
        if (String(user._id) === String(req.user.id)) {
            return res.status(400).json({
                message: "You cannot deactivate your own account.",
            });
        }

        // Flip the isActive value
        // If it was true it becomes false and vice versa
        user.isActive = !user.isActive;

        // Save the changes
        await user.save();

        // Notify the user about their account status change
        await createNotification({
            userId: user._id,
            type: "system",
            title: user.isActive ? "Account Activated" : "Account Deactivated",
            body: user.isActive
                ? "Your account has been activated by an admin."
                : "Your account has been deactivated by an admin. Contact support for help.",
        });

        // Send the response
        res.json({
            message: `User account ${user.isActive ? "activated" : "deactivated"} successfully.`,
            user,
        });

    } catch (err) {
        console.error("Toggle user active error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
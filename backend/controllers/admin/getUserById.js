// Import the User model
const User = require("../../models/user.model");

// Import the Report model to get user's reports
const Report = require("../../models/Report.model");

// Import the Match model to get user's matches
const Match = require("../../models/Match.model");

module.exports = async (req, res) => {
    try {
        // Find the user by ID from the URL
        const user = await User.findById(req.params.id)
            .select("-password -verificationCode");

        // Check if user exists
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Get this user's reports
        const reports = await Report.find({
            userId: req.params.id,
            deletedAt: null,
        })
            .sort({ createdAt: -1 })
            .limit(10);

        // Get total report count
        const totalReports = await Report.countDocuments({
            userId: req.params.id,
            deletedAt: null,
        });

        // Send the response with user info and their activity
        res.json({
            user,
            activity: {
                totalReports,
                recentReports: reports,
            },
        });

    } catch (err) {
        console.error("Admin get user by id error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
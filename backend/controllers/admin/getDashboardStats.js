// Import all models
const User = require("../../models/user.model");
const Report = require("../../models/Report.model");
const Match = require("../../models/Match.model");
const Conversation = require("../../models/Conversation.model");

module.exports = async (req, res) => {
    try {
        // Count total users
        const totalUsers = await User.countDocuments({
            role: "user",
        });

        // Count active users
        const activeUsers = await User.countDocuments({
            role: "user",
            isActive: true,
        });

        // Count total reports
        const totalReports = await Report.countDocuments({
            deletedAt: null,
        });

        // Count open reports
        const openReports = await Report.countDocuments({
            status: "open",
            deletedAt: null,
        });

        // Count matched reports
        const matchedReports = await Report.countDocuments({
            status: "matched",
            deletedAt: null,
        });

        // Count resolved reports
        const resolvedReports = await Report.countDocuments({
            status: "resolved",
            deletedAt: null,
        });

        // Count total lost reports
        const lostReports = await Report.countDocuments({
            type: "lost",
            deletedAt: null,
        });

        // Count total found reports
        const foundReports = await Report.countDocuments({
            type: "found",
            deletedAt: null,
        });

        // Count total matches
        const totalMatches = await Match.countDocuments();

        // Count accepted matches
        const acceptedMatches = await Match.countDocuments({
            status: "accepted",
        });

        // Count pending matches
        const pendingMatches = await Match.countDocuments({
            status: "pending",
        });

        // Count active conversations
        const activeConversations = await Conversation.countDocuments({
            status: "active",
        });

        // Get the 5 most recent reports for the admin feed
        const recentReports = await Report.find({ deletedAt: null })
            .populate("userId", "name email avatar")
            .sort({ createdAt: -1 })
            .limit(5);

        // Get the 5 most recently registered users
        const recentUsers = await User.find({ role: "user" })
            .select("-password -verificationCode")
            .sort({ createdAt: -1 })
            .limit(5);

        // Send everything in one response
        res.json({
            users: {
                total: totalUsers,
                active: activeUsers,
            },
            reports: {
                total: totalReports,
                open: openReports,
                matched: matchedReports,
                resolved: resolvedReports,
                lost: lostReports,
                found: foundReports,
            },
            matches: {
                total: totalMatches,
                accepted: acceptedMatches,
                pending: pendingMatches,
            },
            conversations: {
                active: activeConversations,
            },
            recentReports,
            recentUsers,
        });

    } catch (err) {
        console.error("Admin dashboard stats error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
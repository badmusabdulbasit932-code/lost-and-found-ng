// Import the User model
const User = require("../../models/user.model");

module.exports = async (req, res) => {
    try {
        // Get filter options from query params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const search = req.query.search || "";
        const role = req.query.role || "";
        const isActive = req.query.isActive;

        // Calculate how many documents to skip
        const skip = (page - 1) * limit;

        // Start with an empty filter object
        const filter = {};

        // If search is provided search by name or email
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        // If role is provided filter by role
        if (role) {
            filter.role = role;
        }

        // If isActive is provided filter by active status
        // We check for the string "true" because query params are strings
        if (isActive !== undefined) {
            filter.isActive = isActive === "true";
        }

        // Count total users matching the filter
        const total = await User.countDocuments(filter);

        // Get the users — never return passwords
        const users = await User.find(filter)
            .select("-password -verificationCode")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Send the response
        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            users,
        });

    } catch (err) {
        console.error("Admin get all users error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
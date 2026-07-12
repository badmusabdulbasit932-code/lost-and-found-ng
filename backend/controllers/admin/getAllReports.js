// Import the Report model
const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
    try {
        // Get filter options from query params
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const type = req.query.type || "";
        const status = req.query.status || "";
        const category = req.query.category || "";
        const search = req.query.search || "";

        // Calculate how many to skip
        const skip = (page - 1) * limit;

        // Start with empty filter
        // Admin can see ALL reports including deleted ones
        const filter = {};

        // Apply filters only if provided
        if (type) filter.type = type;
        if (status) filter.status = status;
        if (category) filter.category = category;

        // Search by title or description
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { location: { $regex: search, $options: "i" } },
            ];
        }

        // Count total reports
        const total = await Report.countDocuments(filter);

        // Get the reports with owner info
        const reports = await Report.find(filter)
            .populate("userId", "name email avatar")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Send the response
        res.json({
            total,
            page,
            totalPages: Math.ceil(total / limit),
            reports,
        });

    } catch (err) {
        console.error("Admin get all reports error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
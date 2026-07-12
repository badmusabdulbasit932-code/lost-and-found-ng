// Import the Report model
const Report = require("../../models/Report.model");

// Import notification service
const { createNotification } = require("../../services/notification.service");

module.exports = async (req, res) => {
    try {
        // Get the reason from the request body
        const { reason } = req.body;

        // Reason is required — admin must explain why they deleted it
        if (!reason) {
            return res.status(400).json({
                message: "Please provide a reason for deleting this report.",
            });
        }

        // Find the report
        const report = await Report.findById(req.params.id);

        // Check if it exists
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        // Check if already deleted
        if (report.deletedAt) {
            return res.status(400).json({ message: "Report already deleted." });
        }

        // Soft delete the report
        report.deletedAt = new Date();
        report.status = "closed";

        // Save the changes
        await report.save();

        // Notify the report owner
        await createNotification({
            userId: report.userId,
            type: "report_update",
            title: "Report Removed",
            body: `Your report "${report.title}" was removed by an admin. Reason: ${reason}`,
            relatedReport: report._id,
        });

        // Send the response
        res.json({
            message: "Report deleted successfully.",
        });

    } catch (err) {
        console.error("Admin delete report error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
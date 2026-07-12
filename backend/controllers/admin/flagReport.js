// Import the Report model
const Report = require("../../models/Report.model");

// Import notification service
const { createNotification } = require("../../services/notification.service");

module.exports = async (req, res) => {
    try {
        // Get the reason from the request body
        const { reason } = req.body;

        // Reason is required
        if (!reason) {
            return res.status(400).json({
                message: "Please provide a reason for flagging this report.",
            });
        }

        // Find the report
        const report = await Report.findById(req.params.id);

        // Check if it exists
        if (!report) {
            return res.status(404).json({ message: "Report not found." });
        }

        // Close the report — flagged reports should not be visible
        report.status = "closed";

        // Save the changes
        await report.save();

        // Send fraud alert to the report owner
        await createNotification({
            userId: report.userId,
            type: "fraud_alert",
            title: "Report Flagged",
            body: `Your report "${report.title}" has been flagged. Reason: ${reason}. Please contact support.`,
            relatedReport: report._id,
        });

        // Send the response
        res.json({
            message: "Report flagged successfully.",
            report,
        });

    } catch (err) {
        console.error("Flag report error:", err);
        res.status(500).json({ message: "Internal server error." });
    }
};
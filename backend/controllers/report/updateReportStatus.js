const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
  try {
    const { status } = req.body;

    // Validate status value
    const allowedStatuses = ["open", "matched", "resolved"];

    if (!status) {
      return res.status(400).json({ message: "Status is required." });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status must be one of: ${allowedStatuses.join(", ")}.`,
      });
    }

    // Find the report
    const report = await Report.findOne({
      _id:       req.params.id,
      deletedAt: null,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Only owner or admin can update status
    if (
      String(report.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Prevent going backwards
    if (report.status === "resolved") {
      return res.status(400).json({
        message: "A resolved report cannot be changed.",
      });
    }

    // Update the status
    const oldStatus  = report.status;
    report.status    = status;
    report.updatedAt = new Date();
    await report.save();

    res.json({
      message: `Report status updated from "${oldStatus}" to "${status}".`,
      report,
    });
  } catch (err) {
    console.error("Update report status error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
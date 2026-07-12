const Report = require("../../models/Report.model");
const { createNotification } = require("../../services/notification.service");
const { uploadToCloudinary } = require("../../config/cloudinary");


module.exports = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      deletedAt: null,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Only owner or admin can update
    if (
      String(report.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Track status change for the notification below
    const oldStatus = report.status;

    const allowed = ["title", "description", "category", "location", "reward", "status"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) report[field] = req.body[field];
    });

    const newStatus = report.status;

    // Add new images if uploaded — upload each to Cloudinary first,
    // since multer uses memoryStorage (files only have .buffer, not .path)
    if (req.files && req.files.length > 0) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "lostfound_ng/reports");
        newImages.push(result.secure_url);
      }
      report.images = [...report.images, ...newImages];
    }

    report.updatedAt = new Date();
    await report.save();

    if (String(report.userId) !== String(req.user.id) && oldStatus !== newStatus) {
      await createNotification({
        userId: report.userId,
        type: "report_update",
        title: "Report Status Updated",
        body: `Your report status has been changed from "${oldStatus}" to "${newStatus}".`,
        relatedReport: report._id,
      });
    }

    res.json({ message: "Report updated successfully.", report });
  } catch (err) {
    console.error("Update report error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
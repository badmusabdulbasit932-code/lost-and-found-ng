const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id:       req.params.id,
      deletedAt: null,
    });

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    // Only owner or admin can delete
    if (
      String(report.userId) !== String(req.user.id) &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized." });
    }

    // Soft delete — never actually remove from DB.
    // deletedAt alone is enough; every query already filters on it,
    // so status doesn't need to change (and "closed" isn't a valid
    // value in the schema's status enum anyway).
    report.deletedAt = new Date();
    await report.save();

    res.json({ message: "Report deleted successfully." });
  } catch (err) {
    console.error("Delete report error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id:       req.params.id,
      deletedAt: null,
    }).populate("userId", "name avatar city state phone email");

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    res.json({ report });
  } catch (err) {
    console.error("Get report error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
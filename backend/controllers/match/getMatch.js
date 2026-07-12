const Match = require("../../models/Match.model");

module.exports = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate("lostReportId",  "title description images location category userId")
      .populate("foundReportId", "title description images location category userId")
      .populate("acceptedBy", "name avatar")
      .populate("rejectedBy", "name avatar");

    if (!match) {
      return res.status(404).json({ message: "Match not found." });
    }

    res.json({ match });
  } catch (err) {
    console.error("Get match error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
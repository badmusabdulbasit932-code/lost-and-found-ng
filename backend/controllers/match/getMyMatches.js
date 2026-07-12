const Match = require("../../models/Match.model");
const Report = require("../../models/Report.model");
const { findMatchesForReport } = require("../../services/match.service");

module.exports = async (req, res) => {
  try {
    const { status } = req.query;

    // Get all reports belonging to this user
    const myReports = await Report.find({
      userId: req.user.id,
      deletedAt: null,
    });

    const myReportIds = myReports.map((r) => r._id);

    // Re-run the match algorithm for this user's open reports so that
    // pairs which already existed before a match check ever ran
    // (or whose match logic changed) still get picked up here, not
    // only at the moment a brand-new report is created.
    await Promise.all(
      myReports
        .filter((r) => r.status === "open")
        .map((r) => findMatchesForReport(r))
    );

    // Find all matches where user is involved on either side
    const filter = {
      $or: [
        { lostReportId: { $in: myReportIds } },
        { foundReportId: { $in: myReportIds } },
      ],
    };

    if (status) filter.status = status;

    const matches = await Match.find(filter)
      .populate("lostReportId", "title images location category userId")
      .populate("foundReportId", "title images location category userId")
      .sort({ confidenceScore: -1, createdAt: -1 });

    res.json({ total: matches.length, matches });
  } catch (err) {
    console.error("Get my matches error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;

    const filter = { userId: req.user.id, deletedAt: null };
    if (status) filter.status = status;
    if (type)   filter.type   = type;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Report.countDocuments(filter);

    const reports = await Report.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      reports,
    });
  } catch (err) {
    console.error("Get my reports error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
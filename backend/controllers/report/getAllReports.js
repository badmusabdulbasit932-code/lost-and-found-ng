const Report = require("../../models/Report.model");

module.exports = async (req, res) => {
  try {
    const {
      type,
      category,
      status,
      location,
      search,
      page = 1,
      limit = 12,
    } = req.query;

    const filter = { deletedAt: null };

    if (type)     filter.type     = type;
    if (category) filter.category = category;
    if (status)   filter.status   = status;
    else          filter.status = { $ne: "resolved" }; // hide only fully-recovered items by default

    if (location) {
      filter.location = { $regex: location, $options: "i" };
    }

    if (search) {
      filter.$or = [
        { title:       { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location:    { $regex: search, $options: "i" } },
      ];
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Report.countDocuments(filter);

    const reports = await Report.find(filter)
      .populate("userId", "name avatar city state")
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
    console.error("Get reports error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const Report = require("../../models/Report.model");
const { uploadToCloudinary } = require("../../config/cloudinary");
const { findMatchesForReport } = require("../../services/match.service");

module.exports = async (req, res) => {
  try {
    const { title, description, type, category, location, reward } = req.body;

    // Required fields
    if (!title || !description || !type || !category || !location) {
      return res.status(400).json({
        message: "Title, description, type, category and location are required.",
      });
    }

    // Type must be lost or found
    if (!["lost", "found"].includes(type)) {
      return res.status(400).json({ message: "Type must be 'lost' or 'found'." });
    }

    // Image is required
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        message: "At least one image is required.",
      });
    }

    // Upload each image to Cloudinary
    const images = [];
    const allTags = [];

    for (const file of req.files) {
      const result = await uploadToCloudinary(file.buffer, "lostfound_ng/reports");
      images.push(result.secure_url);

      // Collect AI-detected tags from each image
      if (result.tags && result.tags.length > 0) {
        allTags.push(...result.tags);
      }
    }

    // Remove duplicate tags
    const uniqueTags = [...new Set(allTags)];

    const report = await Report.create({
      title,
      description,
      type,
      category,
      location,
      reward: reward || "",
      images,
      imageTags: uniqueTags, // save the AI tags
      userId: req.user.id,
    });

    // Run match algorithm in background
    findMatchesForReport(report).catch(console.error);

    res.status(201).json({
      message: "Report created successfully.",
      report,
    });
  } catch (err) {
    console.error("Create report error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
const Report = require("../models/Report.model");
const Match = require("../models/Match.model");
const { createNotification } = require("./notification.service");


const STOPWORDS = new Set([
  "i", "a", "an", "the", "is", "it", "in", "on", "at", "to", "of", "and", "or",
  "my", "was", "lost", "found", "please", "help", "this", "that", "with",
  "for", "are", "not", "but", "can", "did", "had", "has", "been", "have",
]);

const tokenize = (text = "") =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));

// Compare image tags from Cloudinary AI
const scoreImageTags = (lostTags = [], foundTags = []) => {
  if (lostTags.length === 0 || foundTags.length === 0) return 0;

  const lost = lostTags.map((t) => t.toLowerCase());
  const found = foundTags.map((t) => t.toLowerCase());

  const shared = lost.filter((tag) => found.includes(tag));
  const ratio = shared.length / Math.max(lost.length, found.length);

  if (ratio >= 0.6) return 30;
  else if (ratio >= 0.4) return 20;
  else if (ratio >= 0.2) return 10;
  else if (ratio >= 0.1) return 5;
  return 0;
};

// Score two reports against each other (0 - 100)
const scoreMatch = (lost, found) => {
  const breakdown = {
    category: 0,
    images: 0,
    title: 0,
    location: 0,
    date: 0,
    brand: 0,
    model: 0,
    color: 0,
    markings: 0,
  };

  // Category must match — if not return 0 immediately
  if (String(lost.category) !== String(found.category)) {
    return { score: 0, breakdown };
  }
  breakdown.category = 25;

  // Image tag comparison — 30 pts (most important)
  breakdown.images = scoreImageTags(
    lost.imageTags || [],
    found.imageTags || []
  );

  // Title + description keyword overlap — 15 pts
  const lostWords = tokenize((lost.title || "") + " " + (lost.description || ""));
  const foundWords = tokenize((found.title || "") + " " + (found.description || ""));
  const common = lostWords.filter((w) => foundWords.includes(w));
  const overlap = common.length / Math.max(lostWords.length, foundWords.length, 1);

  if (overlap >= 0.3) breakdown.title = 15;
  else if (overlap >= 0.15) breakdown.title = 9;
  else if (overlap >= 0.05) breakdown.title = 4;

  // Location similarity — 15 pts
  const lostLoc = (lost.location || "").toLowerCase();
  const foundLoc = (found.location || "").toLowerCase();
  if (lostLoc && foundLoc) {
    const lw = lostLoc.split(/\s+/);
    const fw = foundLoc.split(/\s+/);
    const shared = lw.filter((w) => fw.includes(w));
    const ratio = shared.length / Math.max(lw.length, fw.length, 1);
    breakdown.location = Math.round(ratio * 15);
  }

  // Date proximity — 5 pts
  if (lost.createdAt && found.createdAt) {
    const diffDays = Math.abs(
      (new Date(lost.createdAt) - new Date(found.createdAt)) / (1000 * 60 * 60 * 24)
    );
    if (diffDays <= 1) breakdown.date = 5;
    else if (diffDays <= 3) breakdown.date = 3;
    else if (diffDays <= 7) breakdown.date = 2;
    else if (diffDays <= 14) breakdown.date = 1;
  }

  // Brand exact match — 5 pts
  if (
    typeof lost.brand === "string" && typeof found.brand === "string" &&
    lost.brand && found.brand &&
    lost.brand.toLowerCase() === found.brand.toLowerCase()
  ) {
    breakdown.brand = 5;
  }

  // Model exact match — 3 pts
  if (
    typeof lost.model === "string" && typeof found.model === "string" &&
    lost.model && found.model &&
    lost.model.toLowerCase() === found.model.toLowerCase()
  ) {
    breakdown.model = 3;
  }

  // Color exact match — 1 pt
  if (
    typeof lost.color === "string" && typeof found.color === "string" &&
    lost.color && found.color &&
    lost.color.toLowerCase() === found.color.toLowerCase()
  ) {
    breakdown.color = 1;
  }

  // Markings keyword overlap — 1 pt
  if (lost.markings && found.markings) {
    const lostM = tokenize(lost.markings);
    const foundM = tokenize(found.markings);
    const shared = lostM.filter((w) => foundM.includes(w));
    if (shared.length > 0) breakdown.markings = 1;
  }

  const score = Object.values(breakdown).reduce((a, b) => a + b, 0);
  return { score: Math.min(score, 100), breakdown };
};

// Called automatically after every new report is created
const findMatchesForReport = async (newReport) => {
  try {
    const oppositeType = newReport.type === "lost" ? "found" : "lost";

    // Find all open reports of opposite type with same category
    const candidates = await Report.find({
      type: oppositeType,
      category: newReport.category,
      status: "open",
      deletedAt: null,
      _id: { $ne: newReport._id },
    });

    for (const candidate of candidates) {
      const lostReport = newReport.type === "lost" ? newReport : candidate;
      const foundReport = newReport.type === "lost" ? candidate : newReport;

      const { score, breakdown } = scoreMatch(lostReport, foundReport);

      // Save any match with a non-trivial confidence score (UI already
      // buckets these into Low/Moderate/High confidence tiers)
      if (score >= 20) {
        // Check if this match already exists
        let match = await Match.findOne({
          lostReportId: lostReport._id,
          foundReportId: foundReport._id,
        });

        if (!match) {
          match = await Match.create({
            lostReportId: lostReport._id,
            foundReportId: foundReport._id,
            confidenceScore: score,
            matchType: "AI",
            similarityBreakdown: {
              category: breakdown.category,
              title: breakdown.title,
              location: breakdown.location,
              date: breakdown.date,
              brand: breakdown.brand,
              model: breakdown.model,
              color: breakdown.color,
              markings: breakdown.markings,
            },
          });

          console.log(`✅ Match created — score: ${score}%`);

          await createNotification({
            userId: candidate.userId,
            type: "match",
            title: "Potential Match Found",
            body: `We found a possible match for your ${candidate.type} report with ${score}% confidence.`,
            relatedMatch: match._id,
            relatedReport: candidate._id,
          });

          // Also notify the owner of the new report
          await createNotification({
            userId: newReport.userId,
            type: "match",
            title: "Potential Match Found",
            body: `We found a possible match for your ${newReport.type} report with ${score}% confidence.`,
            relatedMatch: match._id,
            relatedReport: newReport._id,
          });
        }

      }
    }
  } catch (err) {
    console.error("Match service error:", err.message);
  }
};

module.exports = { findMatchesForReport, scoreMatch };
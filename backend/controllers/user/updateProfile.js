const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const allowed = ["name", "phone", "address", "city", "state", "bio"];
    const updates = {};

    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password -verificationCode");

    res.json({ message: "Profile updated successfully.", user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};
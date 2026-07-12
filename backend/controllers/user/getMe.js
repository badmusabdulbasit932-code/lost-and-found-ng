const User = require("../../models/user.model");

module.exports = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationCode");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Internal server error." });
  }
};
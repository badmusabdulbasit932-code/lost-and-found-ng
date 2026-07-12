const User   = require("../../models/user.model");
const bcrypt = require("bcryptjs");

module.exports = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, code and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid code." });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Invalid or expired code." });
    }

    user.password         = bcrypt.hashSync(newPassword, 10);
    user.verificationCode = "";
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
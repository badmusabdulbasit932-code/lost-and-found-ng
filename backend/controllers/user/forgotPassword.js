const User     = require("../../models/user.model");
const sendMail = require("../../services/email.service");
const { customAlphabet } = require("nanoid");

module.exports = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await User.findOne({ email });

    // Always return success — don't reveal if email exists or not
    if (!user) {
      return res.json({ message: "If that email exists, a reset code has been sent." });
    }

    const nanoid = customAlphabet("0123456789", 6);
    const resetCode = nanoid();

    user.verificationCode = resetCode;
    await user.save();

    await sendMail({
      recipient: user.email,
      subject: "Reset your Lost & Found NG password",
      message: `
        <p>Hello ${user.name},</p>
        <p>Your password reset code is:</p>
        <h2 style="letter-spacing:8px;">${resetCode}</h2>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: "If that email exists, a reset code has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
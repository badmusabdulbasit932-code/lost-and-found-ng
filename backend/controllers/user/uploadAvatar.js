const User = require("../../models/user.model");
const { uploadToCloudinary } = require("../../config/cloudinary");

module.exports = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload an image." });
    }

    const result = await uploadToCloudinary(req.file.buffer, "lostfound_ng/avatars");

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: result.secure_url },
      { new: true }
    ).select("-password -verificationCode");

    res.json({ message: "Avatar uploaded successfully.", avatar: user.avatar, user });
  } catch (err) {
    console.error("Upload avatar error:", err);
    res.status(500).json({ message: "Internal server error." });
  }
};
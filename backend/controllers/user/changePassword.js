const User = require("../../models/user.model")
const bcrypt = require("bcryptjs")

module.exports = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Both current and new password are required.",
            })
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "New password must be at least 6 characters.",
            })
        }

        // Find user and include password field
        const user = await User.findById(req.user.id).select("+password")
        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }

        // Check current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isMatch) {
            return res.status(400).json({
                message: "Current password is incorrect.",
            })
        }

        // Hash and save new password
        user.password = bcrypt.hashSync(newPassword, 10)
        await user.save()

        res.json({ message: "Password changed successfully." })
    } catch (err) {
        console.error("Change password error:", err)
        res.status(500).json({ message: "Internal server error." })
    }
}
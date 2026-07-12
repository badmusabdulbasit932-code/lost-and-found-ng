const User = require('../../models/user.model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = (req, res) => {

    const { email, password } = req.body

    // Check required fields
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." })
    }

    User.findOne({ email })
        .then(user => {

            // Check user exists
            if (!user) {
                return res.status(400).json({ message: "Invalid email or password." })
            }

            // Check password matches
            const passwordMatch = bcrypt.compareSync(password, user.password)
            if (!passwordMatch) {
                return res.status(400).json({ message: "Invalid email or password." })
            }

            // Check account is active 
            if (!user.isActive) {
                return res.status(400).json({ message: "This account is no longer active." })
            }

            // Check email is verified
            if (!user.verified) {
                return res.status(400).json({ message: "Email not verified. Please verify your email before logging in." })
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            )

            return res.status(200).json({
                message: "Login successful.",
                user,
                token,
            })

        })
        .catch(err => {
            console.error("Login error:", err)
            res.status(500).json({ message: "Internal server error." })
        })

}
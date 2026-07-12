const User = require('../../models/user.model');
module.exports = (req, res) => {
    const {verificationCode, email} = req.body;
    if (!verificationCode || !email) {
        return res.status(400).json({message: 'Invalid request'});
    }

    User.findOne({ email: email})
    .then(async user => {
        if (!user) {
            return res.status(400).json({message: "User not found"});
        }
        if (user.verificationCode !== verificationCode) {
            return res.status(400).json({message: "Invalid verification code"});
        }

        user.verified = true;
        user.verificationCode = undefined;
        await user.save();
        res.status(200).json({message: "Email verified successfully"});
    })
    .catch(err => {
        return res.status(500).json({message: "Internal server error"});
    })
}
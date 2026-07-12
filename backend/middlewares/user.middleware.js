const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

module.exports = async (req, res, next) => {
    const {authorization} = req.headers;

    if (!authorization) {
        return res.status(401).json({message: "You are not authorized for this action."});
    }

    const token = authorization.split(" ")[1];
    if (!token) {
        return res.status(401).json({message: "You are not authorized for this action."});
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(payload.id);
        if (!user) {
            return res.status(401).json({message: "You are not authorized for this action."});
        }

        req.user = payload;
        next();
    } catch (error) {
        return res.status(401).json({message: "You are not authorized for this action."});
    }

};
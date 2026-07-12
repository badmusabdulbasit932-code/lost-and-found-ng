// This middleware runs after the auth middleware
// auth middleware confirms the user is logged in
// this middleware confirms the logged-in user is an admin

module.exports = (req, res, next) => {

    // req.user is set by the auth middleware
    // Check if the user has admin role
    if (req.user.role !== "admin") {
        return res.status(403).json({
            message: "Access denied. Admins only.",
        });
    }

    // User is an admin — allow the request to continue
    next();
};
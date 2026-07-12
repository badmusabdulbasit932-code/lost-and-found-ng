// Import express
const express = require("express");

// Create a router
const router = express.Router();

// Import auth middleware — confirms user is logged in
const auth = require("../middlewares/user.middleware");

// Import admin middleware — confirms user is an admin
const admin = require("../middlewares/admin.middleware");

// Import controllers
const getAllUsers = require("../controllers/admin/getAllUsers");
const getUserById = require("../controllers/admin/getUserById");
const toggleUserActive = require("../controllers/admin/toggleUserActive");
const getAllReports = require("../controllers/admin/getAllReports");
const deleteReport = require("../controllers/admin/deleteReport");
const flagReport = require("../controllers/admin/flagReport");
const getDashboardStats = require("../controllers/admin/getDashboardStats");

// Apply both auth and admin middleware to ALL routes in this file
// Every route below requires the user to be logged in AND be an admin
router.use(auth);
router.use(admin);

// Dashboard stats
router.get("/stats", getDashboardStats);

// User management
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.patch("/users/:id/toggle", toggleUserActive);

// Report management
router.get("/reports", getAllReports);
router.delete("/reports/:id", deleteReport);
router.patch("/reports/:id/flag", flagReport);

module.exports = router;
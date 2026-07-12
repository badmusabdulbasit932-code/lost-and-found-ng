// Import express
const express = require("express");

// Create a router
const router = express.Router();

// Import auth middleware
const auth = require("../middlewares/user.middleware");

// Import controllers
const getNotifications = require("../controllers/notification/getNotifications");
const markAsRead = require("../controllers/notification/markAsRead");
const markAllAsRead = require("../controllers/notification/markAllAsRead");
const deleteNotification = require("../controllers/notification/deleteNotification");

// Apply auth to all notification routes
// All routes below this line require login
router.use(auth);

// Get all notifications for the logged-in user
router.get("/", getNotifications);

// Mark all notifications as read
// This must come BEFORE /:id route
// Otherwise Express thinks "all" is an ID
router.patch("/mark-all-read", markAllAsRead);

// Mark one notification as read
router.patch("/:id", markAsRead);

// Delete one notification
router.delete("/:id", deleteNotification);

module.exports = router;
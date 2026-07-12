const express = require("express");
const router = express.Router();

const sendSupportMessage = require("../controllers/support/sendSupportMessage");

// Public route — no login required to contact support
router.post("/contact", sendSupportMessage);

module.exports = router;

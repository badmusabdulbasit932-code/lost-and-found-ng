const express = require("express");
const router = express.Router();

const auth = require("../middlewares/user.middleware");
const { upload } = require("../config/cloudinary");

const startConversation = require("../controllers/message/startConversation");
const getMyConversations = require("../controllers/message/getMyConversations");
const sendMessage = require("../controllers/message/sendMessage");
const getMessages = require("../controllers/message/getMessages");
const editMessage = require("../controllers/message/editMessage");
const deleteMessage = require("../controllers/message/deleteMessage");
const requestPrivacyReveal = require("../controllers/message/requestPrivacyReveal");
const acceptPrivacyReveal = require("../controllers/message/acceptPrivacyReveal");

// All routes require login
router.use(auth);

// Conversations
router.post("/conversations", startConversation);
router.get("/conversations", getMyConversations);

// Messages
router.post("/conversations/:conversationId/messages", upload.array("attachments", 5), sendMessage);
router.get("/conversations/:conversationId/messages", getMessages);

// Edit and delete
router.patch("/messages/:messageId", editMessage);
router.delete("/messages/:messageId", deleteMessage);

// Privacy reveal
router.post("/conversations/:conversationId/request-reveal", requestPrivacyReveal);
router.post("/conversations/:conversationId/accept-reveal", acceptPrivacyReveal);

module.exports = router;
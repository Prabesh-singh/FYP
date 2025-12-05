const express = require("express");
const router = express.Router();
const chatController = require("../controllers/messageController");

// Get doctors in user's chat list
router.get("/user/:userId/contacts", chatController.getUserContacts);

// Get users in doctor's chat list
router.get("/doctor/:doctorId/contacts", chatController.getDoctorContacts);

// Conversation messages
router.get("/conversation/:senderId/:receiverId", chatController.getConversation);

// Send a message
router.post("/send", chatController.sendMessage);

module.exports = router;

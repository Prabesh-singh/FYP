const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chatController");

// Demo routes (no JWT, for testing/viva)
router.get("/user/:userId", chatController.getUserChatListDemo);
router.get("/doctor/:doctorId", chatController.getDoctorChatListDemo);
router.get("/room/:appointmentId/:userId", chatController.getChatRoomDemo);
router.get("/messages/:roomId/:userId", chatController.getMessagesDemo);

module.exports = router;

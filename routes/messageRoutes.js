const express = require("express");
const router = express.Router();
const { getMessages, sendMessage } = require("../controllers/messageController");

// GET messages between user and doctor
router.get("/:userId/:doctorId", getMessages);

// POST a new message
router.post("/", sendMessage);

module.exports = router;

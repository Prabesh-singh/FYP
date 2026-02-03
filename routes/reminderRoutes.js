const express = require("express");
const router = express.Router();
const { sendUpcomingReminders } = require("../controllers/reminder");

// Manual trigger API
router.post("/send", sendUpcomingReminders);

module.exports = router;

// routes/doctorAvailabilityRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/AvaibleControllers");

// Add or update a date's availability
router.post("/doctor-availability/:doctorId", controller.addOrUpdateAvailability);

// Get all availability for a doctor
router.get("/doctor-availability/:doctorId", controller.getAvailability);

// Delete availability for a specific date
router.delete("/doctor-availability/:doctorId/:date", controller.deleteAvailability);

module.exports = router;

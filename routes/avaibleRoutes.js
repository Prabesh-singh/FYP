const express = require("express");
const router = express.Router();

const {
    addOrUpdateAvailability,
    getAvailability,
    deleteAvailability,
} = require("../controllers/doctorAvailability"); // must exist

// Add or update availability
router.post("/doctor-availability/:doctorId", addOrUpdateAvailability);

// Get availability
router.get("/doctor-availability/:doctorId", getAvailability);

// Delete availability
router.delete("/doctor-availability/:doctorId/:date", deleteAvailability);

module.exports = router;

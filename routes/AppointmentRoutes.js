const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Book a new appointment
router.post("/book", appointmentController.bookAppointment);

// Confirm an appointment
router.post("/confirm", appointmentController.confirmAppointment);

// Get appointments (optional)
router.get("/", appointmentController.getAppointments);

module.exports = router;


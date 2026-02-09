const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");

// Book a new appointment
router.post("/book", appointmentController.bookAppointment);

// Get all appointments (optional filters with query)
router.get("/", appointmentController.getAppointments);

// Get appointments by doctor
router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
router.delete("/doctor/:doctorId/clear", appointmentController.clearDoctorHistory);

// Get today's appointments by doctor
router.get("/doctor/today/:doctorId", appointmentController.getTodayAppointments);

// Add this route for user appointments
router.get("/user/:userId", appointmentController.getAppointmentsByUser);

module.exports = router;

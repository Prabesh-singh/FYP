// routes/AppointmentRoutes.js
const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor"); // Import Doctor model

// ===============================
// 1️⃣ Book a new appointment
// ===============================
router.post("/appointments/book", async (req, res) => {
    try {
        const { userId, doctorId, scheduledAt, reason, fee } = req.body;

        if (!userId || !doctorId || !scheduledAt || !fee) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        const newAppointment = new Appointment({
            userId,
            doctorId,
            scheduledAt,
            reason,
            payment: { status: "Pending", amount: fee }
        });

        const savedAppointment = await newAppointment.save();

        res.json({ success: true, appointment: savedAppointment });
    } catch (err) {
        console.error("Book Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// ===============================
// 2️⃣ Confirm an appointment
// ===============================
router.post("/confirm", async (req, res) => {
    const { appointmentId } = req.body;

    if (!appointmentId) {
        return res.status(400).json({ success: false, message: "appointmentId is required" });
    }

    try {
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment) {
            return res.status(404).json({ success: false, message: "Appointment not found" });
        }

        // Ensure payment object exists
        if (!appointment.payment) {
            appointment.payment = { status: "Pending", amount: 0 };
        }

        // Update status and payment
        appointment.status = "Confirmed";
        appointment.payment.status = "Completed";

        const savedAppointment = await appointment.save();

        // Fetch doctor details
        const doctor = await Doctor.findById(savedAppointment.doctorId);

        if (!doctor) {
            return res.status(404).json({ success: false, message: "Doctor not found" });
        }

        res.json({ success: true, doctor });
    } catch (err) {
        console.error("Confirm Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;

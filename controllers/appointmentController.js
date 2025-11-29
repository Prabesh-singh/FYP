const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// 1️⃣ Book a new appointment
exports.bookAppointment = async (req, res) => {
    try {
        const { userId, doctorId, scheduledAt, reason, fee } = req.body;

        if (!userId || !doctorId || !scheduledAt || !fee) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // Convert scheduledAt to proper UTC date
        const scheduledDate = new Date(scheduledAt).toISOString();

        // Check if slot already booked (same doctor, exact time)
        const existing = await Appointment.findOne({
            doctorId,
            scheduledAt: scheduledDate,
            status: { $in: ['Pending', 'Confirmed'] }
        });

        if (existing) {
            return res.status(400).json({ success: false, message: "This time slot is already booked" });
        }

        const newAppointment = new Appointment({
            userId,
            doctorId,
            scheduledAt: scheduledDate,
            reason,
            payment: { status: "Pending", amount: fee }
        });

        const savedAppointment = await newAppointment.save();
        res.json({ success: true, appointment: savedAppointment });

    } catch (err) {
        console.error("Book Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 2️⃣ Confirm an appointment
exports.confirmAppointment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        if (!appointmentId) return res.status(400).json({ success: false, message: "appointmentId is required" });

        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

        appointment.status = "Confirmed";
        appointment.payment.status = "Completed";

        const savedAppointment = await appointment.save();

        const doctor = await Doctor.findById(savedAppointment.doctorId);
        if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

        res.json({ success: true, appointment: savedAppointment, doctor });

    } catch (err) {
        console.error("Confirm Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 3️⃣ Get appointments by user or doctor
exports.getAppointments = async (req, res) => {
    try {
        const { userId, doctorId } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        if (doctorId) filter.doctorId = doctorId;

        const appointments = await Appointment.find(filter).populate('doctorId').populate('userId');
        res.json({ success: true, appointments });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

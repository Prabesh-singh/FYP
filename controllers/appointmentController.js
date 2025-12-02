// const Appointment = require("../models/Appointment");
// const Doctor = require("../models/Doctor");

// // 1️⃣ Book a new appointment
// exports.bookAppointment = async (req, res) => {
//     try {
//         const { userId, doctorId, scheduledAt, reason, fee } = req.body;

//         if (!userId || !doctorId || !scheduledAt || !fee) {
//             return res.status(400).json({ success: false, message: "Required fields missing" });
//         }

//         const scheduledDate = new Date(scheduledAt).toISOString();

//         // Atomic operation: Only create if slot is free
//         const result = await Appointment.findOneAndUpdate(
//             {
//                 doctorId,
//                 scheduledAt: scheduledDate,
//                 status: { $nin: ['Pending', 'Confirmed'] }   // only if free or cancelled
//             },
//             {
//                 $setOnInsert: {
//                     userId,
//                     doctorId,
//                     scheduledAt: scheduledDate,
//                     reason,
//                     status: "Pending",
//                     payment: { status: "Pending", amount: fee }
//                 }
//             },
//             {
//                 new: true,
//                 upsert: true   // creates ONLY if no match
//             }
//         );

//         // If status is not 'Pending', slot was already booked
//         if (result.status !== "Pending" || result.userId.toString() !== userId) {
//             return res.status(400).json({ success: false, message: "Slot already booked by another user" });
//         }

//         res.json({ success: true, appointment: result });

//     } catch (err) {
//         console.error("Book Appointment Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


// // 2️⃣ Confirm an appointment
// exports.confirmAppointment = async (req, res) => {
//     try {
//         const { appointmentId } = req.body;
//         if (!appointmentId) return res.status(400).json({ success: false, message: "appointmentId is required" });

//         const appointment = await Appointment.findById(appointmentId);
//         if (!appointment) return res.status(404).json({ success: false, message: "Appointment not found" });

//         appointment.status = "Confirmed";
//         appointment.payment.status = "Completed";

//         const savedAppointment = await appointment.save();

//         const doctor = await Doctor.findById(savedAppointment.doctorId);
//         if (!doctor) return res.status(404).json({ success: false, message: "Doctor not found" });

//         res.json({ success: true, appointment: savedAppointment, doctor });

//     } catch (err) {
//         console.error("Confirm Appointment Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // 3️⃣ Get appointments by user or doctor
// exports.getAppointments = async (req, res) => {
//     try {
//         const { userId, doctorId } = req.query;
//         const filter = {};
//         if (userId) filter.userId = userId;
//         if (doctorId) filter.doctorId = doctorId;

//         const appointments = await Appointment.find(filter).populate('doctorId').populate('userId');
//         res.json({ success: true, appointments });
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");

// Book appointment (auto-confirmed, atomic)
// Book appointment (auto-confirm, supports new slots)
exports.bookAppointment = async (req, res) => {
    try {
        const { userId, doctorId, date, selectedTime, reason, fee } = req.body;

        if (!userId || !doctorId || !date || !selectedTime) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        // Normalize date/time
        const scheduledAt = new Date(`${date}T${selectedTime}`);

        // 1️⃣ Check if the user already booked this slot
        const existingAppointment = await Appointment.findOne({
            userId,
            doctorId,
            scheduledAt,
            status: "Confirmed",
        });

        if (existingAppointment) {
            return res.status(400).json({
                success: false,
                message: "You have already booked this slot",
            });
        }

        // 2️⃣ Check if slot already booked by any user
        const slotTaken = await Appointment.findOne({
            doctorId,
            scheduledAt,
            status: "Confirmed",
        });

        if (slotTaken) {
            return res.status(400).json({
                success: false,
                message: "Slot already booked by another user",
            });
        }

        // 3️⃣ Create appointment and auto-confirm
        const appointment = await Appointment.create({
            userId,
            doctorId,
            scheduledAt,
            reason,
            status: "Confirmed",
            payment: { status: "Pending", amount: fee || 0 },
        });

        // 4️⃣ Optional: remove slot from DoctorAvailability
        await DoctorAvailability.findOneAndUpdate(
            { doctor: doctorId, "times.time": selectedTime },
            { $pull: { times: { time: selectedTime } } }
        );

        res.json({ success: true, appointment });

    } catch (err) {
        console.error("Book Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Get appointments by user or doctor
exports.getAppointments = async (req, res) => {
    try {
        const { userId, doctorId } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        if (doctorId) filter.doctorId = doctorId;

        const appointments = await Appointment.find(filter)
            .populate("doctorId", "name specialization")
            .populate("userId", "name email");

        res.json({ success: true, appointments });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

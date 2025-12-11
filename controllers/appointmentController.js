// const Appointment = require("../models/Appointment");
// const DoctorAvailability = require("../models/DoctorAvailability");

// // Book appointment (auto-confirmed, atomic)
// // Book appointment (auto-confirm, supports new slots)
// exports.bookAppointment = async (req, res) => {
//     try {
//         const { userId, doctorId, date, selectedTime, reason, fee } = req.body;

//         if (!userId || !doctorId || !date || !selectedTime) {
//             return res.status(400).json({ success: false, message: "Required fields missing" });
//         }

//         // Normalize date/time
//         const scheduledAt = new Date(`${date}T${selectedTime}`);

//         // 1️⃣ Check if the user already booked this slot
//         const existingAppointment = await Appointment.findOne({
//             userId,
//             doctorId,
//             scheduledAt,
//             status: "Confirmed",
//         });

//         if (existingAppointment) {
//             return res.status(400).json({
//                 success: false,
//                 message: "You have already booked this slot",
//             });
//         }

//         // 2️⃣ Check if slot already booked by any user
//         const slotTaken = await Appointment.findOne({
//             doctorId,
//             scheduledAt,
//             status: "Confirmed",
//         });

//         if (slotTaken) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Slot already booked by another user",
//             });
//         }

//         // 3️⃣ Create appointment and auto-confirm
//         const appointment = await Appointment.create({
//             userId,
//             doctorId,
//             scheduledAt,
//             reason,
//             status: "Confirmed",
//             payment: { status: "Pending", amount: fee || 0 },
//         });

//         // 4️⃣ Optional: remove slot from DoctorAvailability
//         await DoctorAvailability.findOneAndUpdate(
//             { doctor: doctorId, "times.time": selectedTime },
//             { $pull: { times: { time: selectedTime } } }
//         );

//         res.json({ success: true, appointment });

//     } catch (err) {
//         console.error("Book Appointment Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // Get appointments by user or doctor
// exports.getAppointments = async (req, res) => {
//     try {
//         const { userId, doctorId } = req.query;
//         const filter = {};
//         if (userId) filter.userId = userId;
//         if (doctorId) filter.doctorId = doctorId;

//         const appointments = await Appointment.find(filter)
//             .populate("doctorId", "name specialization")
//             .populate("userId", "name email");

//         res.json({ success: true, appointments });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");
const mongoose = require("mongoose");

// ==================== 1️⃣ Book Appointment (Atomic, Avoid Race Conditions) ====================
// exports.bookAppointment = async (req, res) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         const { userId, doctorId, date, selectedTime, reason, fee } = req.body;

//         if (!userId || !doctorId || !date || !selectedTime) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ success: false, message: "Required fields missing" });
//         }

//         const scheduledAt = new Date(`${date}T${selectedTime}`);

//         // Check if user already booked this slot
//         const existingAppointment = await Appointment.findOne({
//             userId, doctorId, scheduledAt, status: "Confirmed"
//         }).session(session);

//         if (existingAppointment) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ success: false, message: "You have already booked this slot" });
//         }

//         // Check if slot already booked by another user
//         const slotTaken = await Appointment.findOne({
//             doctorId, scheduledAt, status: "Confirmed"
//         }).session(session);

//         if (slotTaken) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ success: false, message: "Slot already booked by another user" });
//         }

//         // Create appointment
//         const appointment = await Appointment.create([{
//             userId, doctorId, scheduledAt, reason,
//             status: "Confirmed",
//             payment: { status: "Pending", amount: fee || 0 }
//         }], { session });

//         // Remove slot from DoctorAvailability
//         await DoctorAvailability.findOneAndUpdate(
//             { doctor: doctorId, "times.time": selectedTime },
//             { $pull: { times: { time: selectedTime } } },
//             { session }
//         );

//         // Commit transaction
//         await session.commitTransaction();
//         session.endSession();

//         res.json({ success: true, appointment: appointment[0] });

//     } catch (err) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error("Book Appointment Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");

exports.bookAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId, doctorId, date, selectedTime, reason, fee } = req.body;

        if (!userId || !doctorId || !date || !selectedTime) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        const scheduledAt = new Date(`${date}T${selectedTime}`);

        // Check if user already booked this slot
        const existingAppointment = await Appointment.findOne({
            userId,
            doctorId,
            scheduledAt,
            status: "Confirmed",
        }).session(session);

        if (existingAppointment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "You have already booked this slot" });
        }

        // Check if slot already booked by another user
        const slotTaken = await Appointment.findOne({
            doctorId,
            scheduledAt,
            status: "Confirmed",
        }).session(session);

        if (slotTaken) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ success: false, message: "Slot already booked by another user" });
        }

        // Create appointment
        const appointment = await Appointment.create(
            [
                {
                    userId,
                    doctorId,
                    scheduledAt,
                    reason,
                    status: "Confirmed",
                    payment: { status: "Pending", amount: fee || 0 },
                },
            ],
            { session }
        );

        // Remove slot from DoctorAvailability
        await DoctorAvailability.findOneAndUpdate(
            { doctor: doctorId, "times.time": selectedTime },
            { $pull: { times: { time: selectedTime } } },
            { session }
        );

        // Commit transaction
        await session.commitTransaction();
        session.endSession();

        // Emit real-time notification to doctor
        const io = req.app.get("io");
        io.to(doctorId.toString()).emit("newAppointment", {
            message: `New appointment booked by user ${userId}`,
            appointmentId: appointment[0]._id,
            createdAt: new Date(),
        });

        res.json({ success: true, appointment: appointment[0] });
    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Book Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};


// ==================== 2️⃣ Get All Appointments (optional by user/doctor) ====================
exports.getAppointments = async (req, res) => {
    try {
        const { userId, doctorId } = req.query;
        const filter = {};
        if (userId) filter.userId = userId;
        if (doctorId) filter.doctorId = doctorId;

        const appointments = await Appointment.find(filter)
            .populate("userId", "name email phone")
            .populate("doctorId", "name specialization")
            .sort({ scheduledAt: 1 });

        res.json({ success: true, appointments });
    } catch (err) {
        console.error("Get Appointments Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================== 3️⃣ Get Appointments By Doctor ====================
// ==================== Get Appointments By Doctor ====================
exports.getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

        const appointments = await Appointment.find({ doctorId })
            .populate("userId", "fullName email phone address dob gender") // <-- fetch all user info needed
            .populate("doctorId", "name specialization")
            .sort({ scheduledAt: 1 });

        res.json({ success: true, appointments });
    } catch (err) {
        console.error("Get Doctor Appointments Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// ==================== Get Today's Appointments for Doctor ====================
exports.getTodayAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({
                success: false,
                message: "Valid doctorId required",
            });
        }

        // Timezone-safe start and end of today
        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
        const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

        const appointments = await Appointment.find({
            doctorId,
            scheduledAt: { $gte: start, $lte: end },
            status: { $in: ["Confirmed", "completed", "pending"] },
        })
            .populate("userId", "fullName email phone address dob gender")
            .populate("doctorId", "fullName specialization")
            .sort({ scheduledAt: 1 })
            .lean();

        const formattedAppointments = appointments.map((appt) => ({
            _id: appt._id,
            fullName: appt.userId?.fullName || "Unknown",
            email: appt.userId?.email || "N/A",
            phone: appt.userId?.phone || "N/A",
            address: appt.userId?.address || "N/A",
            gender: appt.userId?.gender || "N/A",
            dob: appt.userId?.dob || null,
            reason: appt.reason || "Not provided",
            scheduledAt: appt.scheduledAt,
            status: appt.status,
            payment: {
                status: appt.payment?.status || "Pending",
                amount: appt.payment?.amount || 0,
            },
        }));

        return res.json({
            success: true,
            count: formattedAppointments.length,
            appointments: formattedAppointments,
        });

    } catch (err) {
        console.error("Get Today's Appointments Error:", err);
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
};
// ==================== Clear All Appointment History of a Doctor ====================
exports.clearDoctorHistory = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId) {
            return res.status(400).json({
                success: false,
                message: "doctorId is required"
            });
        }

        // Delete all appointments linked to this doctor
        const result = await Appointment.deleteMany({ doctorId });

        res.json({
            success: true,
            message: "All appointment history cleared successfully",
            deletedCount: result.deletedCount
        });

    } catch (err) {
        console.error("Clear Appointment History Error:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};
// // appointment.controller.js
// const mongoose = require("mongoose");
// const Appointment = require("../models/Appointment");
// const DoctorAvailability = require("../models/DoctorAvailability");

// // -------------------------
// // Convert AM/PM time + date to JS Date
// // -------------------------
// function getScheduledDate(dateStr, timeStr) {
//     const [time, modifier] = timeStr.split(" ");
//     let [hours, minutes] = time.split(":").map(Number);
//     if (modifier === "PM" && hours < 12) hours += 12;
//     if (modifier === "AM" && hours === 12) hours = 0;
//     const date = new Date(dateStr);
//     date.setHours(hours, minutes, 0, 0);
//     return date;
// }

// // -------------------------
// // 1️⃣ Book Appointment
// // -------------------------
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

//         const scheduledAt = getScheduledDate(date, selectedTime);

//         // Check if user already booked this slot
//         const existingAppointment = await Appointment.findOne({
//             userId,
//             doctorId,
//             scheduledAt,
//             status: "Confirmed",
//         }).session(session);

//         if (existingAppointment) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ success: false, message: "You have already booked this slot" });
//         }

//         // Check if slot already booked by another user
//         const slotTaken = await Appointment.findOne({
//             doctorId,
//             scheduledAt,
//             status: "Confirmed",
//         }).session(session);

//         if (slotTaken) {
//             await session.abortTransaction();
//             session.endSession();
//             return res.status(400).json({ success: false, message: "Slot already booked" });
//         }

//         // Create appointment
//         const appointment = await Appointment.create(
//             [
//                 {
//                     userId,
//                     doctorId,
//                     scheduledAt,
//                     reason,
//                     status: "Confirmed",
//                     payment: { status: "Pending", amount: fee || 0 },
//                 },
//             ],
//             { session }
//         );

//         // Remove booked slot from DoctorAvailability
//         await DoctorAvailability.findOneAndUpdate(
//             { doctor: doctorId, "times.time": selectedTime },
//             { $pull: { times: { time: selectedTime } } },
//             { session }
//         );

//         await session.commitTransaction();
//         session.endSession();

//         // Real-time notification to doctor (if socket.io used)
//         const io = req.app.get("io");
//         if (io) {
//             io.to(doctorId.toString()).emit("newAppointment", {
//                 message: `New appointment booked by user ${userId}`,
//                 appointmentId: appointment[0]._id,
//                 createdAt: new Date(),
//             });
//         }

//         res.json({ success: true, appointment: appointment[0] });

//     } catch (err) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error("Book Appointment Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // -------------------------
// // 2️⃣ Get All Appointments (optional: by user or doctor)
// // -------------------------
// exports.getAppointments = async (req, res) => {
//     try {
//         const { userId, doctorId } = req.query;
//         const filter = {};
//         if (userId) filter.userId = userId;
//         if (doctorId) filter.doctorId = doctorId;

//         const appointments = await Appointment.find(filter)
//             .populate("userId", "name email phone")
//             .populate("doctorId", "name specialization")
//             .sort({ scheduledAt: 1 });

//         res.json({ success: true, appointments });
//     } catch (err) {
//         console.error("Get Appointments Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // -------------------------
// // 3️⃣ Get Appointments By Doctor
// // -------------------------
// exports.getAppointmentsByDoctor = async (req, res) => {
//     try {
//         const { doctorId } = req.params;
//         if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

//         const appointments = await Appointment.find({ doctorId })
//             .populate("userId", "fullName email phone address dob gender")
//             .populate("doctorId", "name specialization")
//             .sort({ scheduledAt: 1 });

//         res.json({ success: true, appointments });
//     } catch (err) {
//         console.error("Get Doctor Appointments Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // -------------------------
// // 4️⃣ Get Today's Appointments for Doctor
// // -------------------------
// exports.getTodayAppointments = async (req, res) => {
//     try {
//         const { doctorId } = req.params;

//         if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
//             return res.status(400).json({ success: false, message: "Valid doctorId required" });
//         }

//         const today = new Date();
//         const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
//         const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);

//         const appointments = await Appointment.find({
//             doctorId,
//             scheduledAt: { $gte: start, $lte: end },
//             status: { $in: ["Confirmed", "completed", "pending"] },
//         })
//             .populate("userId", "fullName email phone address dob gender")
//             .populate("doctorId", "fullName specialization")
//             .sort({ scheduledAt: 1 })
//             .lean();

//         const formattedAppointments = appointments.map((appt) => ({
//             _id: appt._id,
//             fullName: appt.userId?.fullName || "Unknown",
//             email: appt.userId?.email || "N/A",
//             phone: appt.userId?.phone || "N/A",
//             address: appt.userId?.address || "N/A",
//             gender: appt.userId?.gender || "N/A",
//             dob: appt.userId?.dob || null,
//             reason: appt.reason || "Not provided",
//             scheduledAt: appt.scheduledAt,
//             status: appt.status,
//             payment: {
//                 status: appt.payment?.status || "Pending",
//                 amount: appt.payment?.amount || 0,
//             },
//         }));

//         res.json({
//             success: true,
//             count: formattedAppointments.length,
//             appointments: formattedAppointments,
//         });

//     } catch (err) {
//         console.error("Get Today's Appointments Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };

// // -------------------------
// // 5️⃣ Clear All Appointment History of a Doctor
// // -------------------------
// exports.clearDoctorHistory = async (req, res) => {
//     try {
//         const { doctorId } = req.params;
//         if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

//         const result = await Appointment.deleteMany({ doctorId });
//         res.json({ success: true, message: "All appointment history cleared", deletedCount: result.deletedCount });
//     } catch (err) {
//         console.error("Clear Appointment History Error:", err);
//         res.status(500).json({ success: false, message: "Server error" });
//     }
// };


// appointment.controller.js
const mongoose = require("mongoose");
const Appointment = require("../models/Appointment");
const DoctorAvailability = require("../models/DoctorAvailability");
const Notification = require("../models/Notification"); // ✅ import Notification model



// -------------------------
// Convert AM/PM time + date to JS Date
// -------------------------
function getScheduledDate(dateStr, timeStr) {
    const [time, modifier] = timeStr.split(" ");
    let [hours, minutes] = time.split(":").map(Number);
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
    const date = new Date(dateStr);
    date.setHours(hours, minutes, 0, 0);
    return date;
}

// -------------------------
// 1️⃣ Book Appointment
// -------------------------
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

        const scheduledAt = getScheduledDate(date, selectedTime);

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
            return res.status(400).json({ success: false, message: "Slot already booked" });
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

        // Remove booked slot from DoctorAvailability
        await DoctorAvailability.findOneAndUpdate(
            { doctor: doctorId, "times.time": selectedTime },
            { $pull: { times: { time: selectedTime } } },
            { session }
        );

        // ✅ Commit transaction
        await session.commitTransaction();
        session.endSession();

        // -----------------------------
        // Real-time notification to doctor (if socket.io used)
        // -----------------------------

        const createdAppointment = appointment[0];

        // -----------------------------
        // 🔔 Notification Section (UPDATED CORRECTLY)
        // -----------------------------
        const io = req.app.get("io");

        // USER Notification
        const userNotification = new Notification({
            receiverId: userId,
            receiverRole: "user",
            title: "Appointment Confirmed",
            message: `Your appointment is booked on ${date} at ${selectedTime}.`,
            appointmentId: createdAppointment._id,
            isRead: false,
        });
        await userNotification.save();

        // Emit real-time notification if socket.io is connected
        if (io) io.to(userId.toString()).emit("newNotification", userNotification);

        // DOCTOR Notification
        const doctorNotification = new Notification({
            receiverId: doctorId,
            receiverRole: "doctor",
            title: "New Appointment",
            message: `You have a new appointment on ${date} at ${selectedTime}.`,
            appointmentId: createdAppointment._id,
            isRead: false,
        });
        await doctorNotification.save();

        if (io) io.to(doctorId.toString()).emit("newNotification", doctorNotification);

        // Final response
        res.json({ success: true, appointment: createdAppointment });

    } catch (err) {
        await session.abortTransaction();
        session.endSession();
        console.error("Book Appointment Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// -------------------------
// 2️⃣ Get All Appointments (optional: by user or doctor)
// -------------------------
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

// -------------------------
// 3️⃣ Get Appointments By Doctor
// -------------------------
exports.getAppointmentsByDoctor = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

        const appointments = await Appointment.find({ doctorId })
            .populate("userId", "fullName email phone address dob gender")
            .populate("doctorId", "name specialization")
            .sort({ scheduledAt: 1 });

        res.json({ success: true, appointments });
    } catch (err) {
        console.error("Get Doctor Appointments Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// -------------------------
// 4️⃣ Get Today's Appointments for Doctor
// -------------------------
exports.getTodayAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;

        if (!doctorId || !mongoose.Types.ObjectId.isValid(doctorId)) {
            return res.status(400).json({ success: false, message: "Valid doctorId required" });
        }

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

        res.json({
            success: true,
            count: formattedAppointments.length,
            appointments: formattedAppointments,
        });

    } catch (err) {
        console.error("Get Today's Appointments Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// -------------------------
// 5️⃣ Clear All Appointment History of a Doctor
// -------------------------
exports.clearDoctorHistory = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

        const result = await Appointment.deleteMany({ doctorId });
        res.json({ success: true, message: "All appointment history cleared", deletedCount: result.deletedCount });
    } catch (err) {
        console.error("Clear Appointment History Error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

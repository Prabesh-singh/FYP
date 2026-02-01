const Appointment = require("../models/Appointment");
const Message = require("../models/Message");

// -------------------- DEMO METHODS --------------------

// Get user's booked doctors
exports.getUserChatListDemo = async (req, res) => {
    try {
        const { userId } = req.params;
        const appointments = await Appointment.find({ userId })
            .populate("doctorId", "fullName email phone avatar")
            .sort({ scheduledAt: -1 });

        const uniqueDoctorsMap = new Map();
        appointments.forEach(app => {
            if (app.doctorId && !uniqueDoctorsMap.has(app.doctorId._id.toString())) {
                uniqueDoctorsMap.set(app.doctorId._id.toString(), {
                    doctor: app.doctorId,
                    appointmentId: app._id,
                    scheduledAt: app.scheduledAt,
                });
            }
        });

        res.json({ success: true, doctors: Array.from(uniqueDoctorsMap.values()) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get doctor's booked users
exports.getDoctorChatListDemo = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const appointments = await Appointment.find({ doctorId })
            .populate("userId", "fullName email phone")
            .sort({ scheduledAt: -1 });

        const uniqueUsersMap = new Map();
        appointments.forEach(app => {
            if (app.userId && !uniqueUsersMap.has(app.userId._id.toString())) {
                uniqueUsersMap.set(app.userId._id.toString(), app);
            }
        });

        res.json({ success: true, users: Array.from(uniqueUsersMap.values()) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get chat room for an appointment
exports.getChatRoomDemo = async (req, res) => {
    try {
        const { appointmentId, userId } = req.params;
        const appointment = await Appointment.findById(appointmentId);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (![appointment.userId.toString(), appointment.doctorId.toString()].includes(userId))
            return res.status(403).json({ message: "Not authorized" });

        res.json({ roomId: appointment._id });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get messages for a room
exports.getMessagesDemo = async (req, res) => {
    try {
        const { roomId, userId } = req.params;
        const appointment = await Appointment.findById(roomId);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        if (![appointment.userId.toString(), appointment.doctorId.toString()].includes(userId))
            return res.status(403).json({ message: "Not authorized" });

        const messages = await Message.find({ roomId }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

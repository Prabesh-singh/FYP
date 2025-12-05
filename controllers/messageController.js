const Message = require("../models/Message");
const Appointment = require("../models/Appointment");
const User = require("../models/User"); // user & doctor info

// 1️⃣ Get chat contacts for a user
exports.getUserContacts = async (req, res) => {
    try {
        const { userId } = req.params;

        // Get confirmed appointments for this user
        const appointments = await Appointment.find({ userId, status: "Confirmed" }).populate("doctorId", "fullName email profilePic");

        // Map to doctor contacts
        const contacts = appointments.map(app => ({
            doctorId: app.doctorId._id,
            fullName: app.doctorId.fullName,
            email: app.doctorId.email,
            profilePic: app.doctorId.profilePic
        }));

        res.json({ success: true, contacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 2️⃣ Get chat contacts for a doctor
exports.getDoctorContacts = async (req, res) => {
    try {
        const { doctorId } = req.params;

        // Get confirmed appointments for this doctor
        const appointments = await Appointment.find({ doctorId, status: "Confirmed" }).populate("userId", "fullName email profilePic");

        // Map to user contacts
        const contacts = appointments.map(app => ({
            userId: app.userId._id,
            fullName: app.userId.fullName,
            email: app.userId.email,
            profilePic: app.userId.profilePic
        }));

        res.json({ success: true, contacts });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 3️⃣ Get conversation messages
exports.getConversation = async (req, res) => {
    try {
        const { senderId, receiverId } = req.params;

        // Ensure confirmed appointment exists
        const appointmentExists = await Appointment.findOne({
            $or: [
                { userId: senderId, doctorId: receiverId },
                { userId: receiverId, doctorId: senderId }
            ],
            status: "Confirmed"
        });

        if (!appointmentExists) {
            return res.status(403).json({ success: false, message: "No conversation allowed without confirmed appointment" });
        }

        const messages = await Message.find({
            $or: [
                { sender: senderId, receiver: receiverId },
                { sender: receiverId, receiver: senderId }
            ]
        })
            .populate("sender", "fullName email profilePic")
            .populate("receiver", "fullName email profilePic")
            .sort({ createdAt: 1 });

        res.json({ success: true, messages });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// 4️⃣ Send message
exports.sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;

        if (!sender || !receiver || !message) {
            return res.status(400).json({ success: false, message: "Missing fields" });
        }

        // Check confirmed appointment exists
        const appointmentExists = await Appointment.findOne({
            $or: [
                { userId: sender, doctorId: receiver },
                { userId: receiver, doctorId: sender }
            ],
            status: "Confirmed"
        });

        if (!appointmentExists) {
            return res.status(403).json({ success: false, message: "Chat not allowed without confirmed appointment" });
        }

        const newMessage = await Message.create({ sender, receiver, message });
        res.json({ success: true, message: newMessage });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

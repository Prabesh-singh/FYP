const Appointment = require("../models/Appointment");
const Message = require("../models/Message");

// GET messages between user and doctor
exports.getMessages = async (req, res) => {
    const { userId, doctorId } = req.params;

    try {
        // Only messages between confirmed appointment participants
        const appointment = await Appointment.findOne({
            status: "Confirmed",
            $or: [
                { userId, doctorId },
                { userId: doctorId, doctorId: userId },
            ],
        });

        if (!appointment) {
            return res.status(403).json({ message: "You are not allowed to view these messages" });
        }

        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: doctorId },
                { sender: doctorId, receiver: userId },
            ],
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

// POST a new message
exports.sendMessage = async (req, res) => {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Only allow chat if sender and receiver have a confirmed appointment
        const appointment = await Appointment.findOne({
            status: "Confirmed",
            $or: [
                { userId: sender, doctorId: receiver },
                { userId: receiver, doctorId: sender },
            ],
        });

        if (!appointment) {
            return res.status(403).json({ message: "You are not allowed to chat with this user/doctor" });
        }

        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

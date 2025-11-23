const Message = require("../models/Message");

// Fetch messages between user and doctor
const getMessages = async (req, res) => {
    const { userId, doctorId } = req.params;
    try {
        const messages = await Message.find({
            $or: [
                { sender: userId, receiver: doctorId },
                { sender: doctorId, receiver: userId },
            ],
        }).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// Send a new message
const sendMessage = async (req, res) => {
    const { sender, receiver, text } = req.body;
    try {
        const message = await Message.create({ sender, receiver, text });
        res.json({ success: true, message });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getMessages, sendMessage };

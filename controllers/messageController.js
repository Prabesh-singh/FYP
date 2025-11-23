const Message = require("../models/Message");

// GET messages between a user and doctor
exports.getMessages = async (req, res) => {
    const { userId, doctorId } = req.params;

    try {
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
        const newMessage = new Message({ sender, receiver, message });
        await newMessage.save();

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

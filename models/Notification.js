const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
    receiverId: mongoose.Schema.Types.ObjectId,
    receiverRole: { type: String, enum: ["user", "doctor"] },
    title: String,
    message: String,
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
    },
    isRead: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

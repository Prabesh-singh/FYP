const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment", required: true },
        senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
        senderRole: { type: String, enum: ["patient", "doctor"], required: true },
        text: { type: String, required: true },
    },
    { timestamps: true }
);

messageSchema.index({ roomId: 1, createdAt: 1 }); // speed up queries

module.exports = mongoose.model("Message", messageSchema);

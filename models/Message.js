const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },  // userId or doctorId
        receiver: { type: String, required: true }, // doctorId or userId
        text: { type: String, required: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);

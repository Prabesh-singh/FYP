const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        sender: { type: String, required: true },
        receiver: { type: String, required: true },
        message: { type: String, required: true },
    },
    { timestamps: true } // automatically add createdAt
);

module.exports = mongoose.model("Message", messageSchema);

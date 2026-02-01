const mongoose = require("mongoose");

const availabilitySchema = new mongoose.Schema(
    {
        doctorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Doctor",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        times: [
            {
                type: String, // store as "time|payment" string
                required: true,
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.model("DoctorAvailability", availabilitySchema);

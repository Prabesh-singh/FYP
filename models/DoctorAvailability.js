const mongoose = require("mongoose");

const DoctorAvailabilitySchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    times: [
        {
            time: { type: String, required: true },
            payment: { type: Number, required: true },
        },
    ],
});

module.exports = mongoose.model("DoctorAvailability", DoctorAvailabilitySchema);

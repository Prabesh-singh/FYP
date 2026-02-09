const mongoose = require("mongoose");

const medicineSchema = new mongoose.Schema({
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    duration: { type: String, required: true },
    instructions: { type: String },
});

const prescriptionSchema = new mongoose.Schema(
    {
        doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor", required: true },
        patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Appointment" },
        medicines: [medicineSchema],
        notes: { type: String },
        expireAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24 hours from creation
    },
    { timestamps: true }
);

// TTL index
prescriptionSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Prescription", prescriptionSchema);

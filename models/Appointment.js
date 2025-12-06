// const mongoose = require("mongoose");

// const prescriptionSchema = new mongoose.Schema({
//     medicines: [{
//         name: String,
//         dose: String,
//         frequency: String,
//         duration: String
//     }],
//     notes: String,
//     createdAt: { type: Date, default: Date.now },
//     prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
// }, { _id: false });

// const appointmentSchema = new mongoose.Schema({
//     userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
//     doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Doctor" },
//     scheduledAt: { type: Date, required: true },
//     reason: { type: String },
//     status: {
//         type: String,
//         enum: ['Confirmed', 'Rescheduled', 'DoctorOnTheWay', 'InProgress', 'Completed', 'Cancelled'],
//         default: 'Confirmed'
//     },
//     price: Number,
//     status: { type: String, default: "Pending" }, // Pending | Paid
//     esewa_token: String,
//     prescription: prescriptionSchema,
//     createdAt: { type: Date, default: Date.now }
// });

// module.exports = mongoose.model("Appointment", appointmentSchema);

const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema({
    medicines: [
        {
            name: String,
            dose: String,
            frequency: String,
            duration: String
        }
    ],
    notes: String,
    createdAt: { type: Date, default: Date.now },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User" },
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "Doctor" },
    scheduledAt: { type: Date, required: true },
    reason: { type: String },
    status: {
        type: String,
        enum: ['Confirmed', 'Rescheduled', 'DoctorOnTheWay', 'InProgress', 'Completed', 'Cancelled', 'Pending', 'Paid'],
        default: 'Pending'
    },
    price: Number, // appointment fee
    esewa_token: String,
    payment: {
        amount: Number,
        status: { type: String, default: "Pending" },
        createdAt: { type: Date, default: Date.now }
    },
    prescription: prescriptionSchema,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Appointment", appointmentSchema);

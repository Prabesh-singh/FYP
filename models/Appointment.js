const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
    medicines: [{
        name: String,
        dose: String,
        frequency: String,
        duration: String
    }],
    notes: String,
    createdAt: { type: Date, default: Date.now },
    prescribedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }
}, { _id: false });

const appointmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // assume User model exists
    doctorId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Doctor' },
    scheduledAt: { type: Date, required: true },
    reason: { type: String },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rescheduled', 'DoctorOnTheWay', 'InProgress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    rescheduleReason: { type: String },
    visitNotes: { type: String },
    sampleCollected: { type: Boolean, default: false },
    testResults: { type: String }, // could be link or text
    prescription: prescriptionSchema,
    deliveryStatus: {
        type: String,
        enum: ['Preparing', 'Dispatched', 'Delivered', 'NotRequired'],
        default: 'NotRequired'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', appointmentSchema);

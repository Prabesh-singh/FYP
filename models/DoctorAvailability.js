const mongoose = require('mongoose');

const DoctorAvailabilitySchema = new mongoose.Schema({
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
    date: { type: Date, required: true },
    times: [String], // ["10:00 AM", "2:00 PM"]
});

module.exports = mongoose.model('DoctorAvailability', DoctorAvailabilitySchema);

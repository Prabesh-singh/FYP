const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    specialization: { type: String },
    experienceYears: { type: Number, default: 0 },
    phone: { type: String },
    ratings: { type: Number, default: 0 },
    numRatings: { type: Number, default: 0 },
    profilePic: { type: String },
    createdAt: { type: Date, default: Date.now }
    
});

module.exports = mongoose.model('Doctor', doctorSchema);

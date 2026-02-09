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
    createdAt: { type: Date, default: Date.now },
    reviews: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            rating: { type: Number, min: 1, max: 5 },
            comment: String,
            createdAt: { type: Date, default: Date.now }
        }
    ],
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 }

});

module.exports = mongoose.model('Doctor', doctorSchema);

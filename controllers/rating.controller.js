const Rating = require("../models/Rating");
const Doctor = require("../models/Doctor");

// -----------------------------
// Submit review & rating
// -----------------------------
exports.submitRating = async (req, res) => {
    try {
        const { doctorId, userId, rating, review } = req.body;

        if (!doctorId || !userId || !rating || !review) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if user already rated this doctor
        const existing = await Rating.findOne({ doctorId, userId });
        if (existing) {
            return res.status(400).json({ success: false, message: "You already submitted a review for this doctor" });
        }

        // Create rating
        const newRating = await Rating.create({ doctorId, userId, rating, review });

        // Recalculate doctor's average rating
        const allRatings = await Rating.find({ doctorId });
        const total = allRatings.reduce((acc, r) => acc + r.rating, 0);
        const avg = total / allRatings.length;

        await Doctor.findByIdAndUpdate(doctorId, { ratings: avg, numRatings: allRatings.length });

        res.json({ success: true, message: "Review submitted successfully", rating: newRating });
    } catch (err) {
        console.error("Submit rating error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// -----------------------------
// Get all reviews of a doctor
// -----------------------------
exports.getDoctorReviews = async (req, res) => {
    try {
        const { doctorId } = req.params;
        if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });

        const reviews = await Rating.find({ doctorId })
            .populate("userId", "fullName email") // show user info
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) {
        console.error("Get doctor reviews error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

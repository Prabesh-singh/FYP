// controllers/doctorAvailabilityController.js
const DoctorAvailability = require("../models/DoctorAvailability");

// Add or Update Availability
exports.addOrUpdateAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, times } = req.body;

        if (!date || !times || !times.length) {
            return res.status(400).json({ success: false, message: "Date and times are required" });
        }

        // Check if availability for that date exists
        let slot = await DoctorAvailability.findOne({ doctor: doctorId, date });

        if (slot) {
            // Update existing
            slot.times = times;
        } else {
            // Create new
            slot = new DoctorAvailability({ doctor: doctorId, date, times });
        }

        await slot.save();
        res.json({ success: true, message: "Availability saved", slot });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all availability for a doctor
exports.getAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const slots = await DoctorAvailability.find({ doctor: doctorId });
        res.json({ success: true, slots });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a specific date availability
exports.deleteAvailability = async (req, res) => {
    try {
        const { doctorId, date } = req.params;
        await DoctorAvailability.findOneAndDelete({ doctor: doctorId, date });
        res.json({ success: true, message: "Availability deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

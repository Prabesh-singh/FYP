const DoctorAvailability = require("../models/DoctorAvailability");

// Add or Update Availability
exports.addOrUpdateAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, times } = req.body; // times = [{ time: "10:00 AM", payment: 300 }, ...]

        if (!date || !times || !times.length) {
            return res.status(400).json({ success: false, message: "Date and times are required" });
        }

        // Convert string to Date
        const availabilityDate = new Date(date);
        availabilityDate.setHours(0, 0, 0, 0); // normalize to start of day

        // Check if availability for that date exists
        let slot = await DoctorAvailability.findOne({ doctor: doctorId, date: availabilityDate });

        if (slot) {
            slot.times = times; // update all times
        } else {
            slot = new DoctorAvailability({ doctor: doctorId, date: availabilityDate, times });
        }

        await slot.save();
        res.json({ success: true, message: "Availability saved", slot });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all availability for a doctor
exports.getAvailability = async (req, res, next) => {
    try {
        const { doctorId } = req.params;

        // Find all availability for this doctor
        const slots = await DoctorAvailability.find({ doctor: doctorId }).sort({ date: 1 });

        const today = new Date();
        today.setHours(0, 0, 0, 0); // normalize

        // Filter out past dates
        const upcomingSlots = slots.filter(slot => slot.date >= today);

        res.json({ success: true, availability: upcomingSlots });
    } catch (err) {
        next(err);
    }
};


// Delete a specific date availability
exports.deleteAvailability = async (req, res) => {
    try {
        const { doctorId, date } = req.params;
        const availabilityDate = new Date(date);
        availabilityDate.setHours(0, 0, 0, 0);
        await DoctorAvailability.findOneAndDelete({ doctor: doctorId, date: availabilityDate });
        res.json({ success: true, message: "Availability deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

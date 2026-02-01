const DoctorAvailability = require("../models/DoctorAvailability");
const Appointment = require("../models/Appointment");

// Add or Update Availability
exports.addOrUpdateAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date, times } = req.body; // times = ["1:00 AM|600", "1:10 AM|610", ...]

        if (!date || !Array.isArray(times) || times.length === 0) {
            return res
                .status(400)
                .json({ success: false, message: "Date and times are required" });
        }

        const availabilityDate = new Date(date);
        availabilityDate.setHours(0, 0, 0, 0);

        // Check if availability exists
        let slot = await DoctorAvailability.findOne({
            doctorId,
            date: availabilityDate,
        });

        if (slot) {
            slot.times = times; // overwrite
        } else {
            slot = new DoctorAvailability({
                doctorId,
                date: availabilityDate,
                times,
            });
        }

        await slot.save();

        res.json({ success: true, message: "Availability saved", slot });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get Availability (remove booked times)
exports.getAvailability = async (req, res) => {
    try {
        const { doctorId } = req.params;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let availability = await DoctorAvailability.find({
            doctorId,
            date: { $gte: today },
        }).sort({ date: 1 });

        const appointments = await Appointment.find({
            doctorId,
            status: { $in: ["Pending", "Confirmed"] },
        });

        // Remove booked times
        const slots = availability
            .map((slot) => {
                const bookedTimes = appointments
                    .filter(
                        (app) =>
                            new Date(app.scheduledAt)
                                .toISOString()
                                .split("T")[0] === slot.date.toISOString().split("T")[0]
                    )
                    .map((app) =>
                        new Date(app.scheduledAt).toLocaleTimeString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true,
                        })
                    );

                const filteredTimes = slot.times.filter((t) => {
                    const [time] = t.split("|"); // extract time part
                    return !bookedTimes.includes(time);
                });

                return { ...slot.toObject(), times: filteredTimes };
            })
            .filter((slot) => slot.times.length > 0);

        res.json({ success: true, slots });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete availability by date
exports.deleteAvailability = async (req, res) => {
    try {
        const { doctorId, date } = req.params;

        const availabilityDate = new Date(date);
        availabilityDate.setHours(0, 0, 0, 0);

        await DoctorAvailability.findOneAndDelete({
            doctorId,
            date: availabilityDate,
        });

        res.json({ success: true, message: "Availability deleted" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

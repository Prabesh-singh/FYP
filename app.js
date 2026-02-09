const express = require("express");
const cors = require("cors");
const cron = require("node-cron");
const DoctorAvailability = require("./models/DoctorAvailability");

const doctorRoutes = require("./routes/doctorRoutes");
const authRoutes = require("./routes/authRoutes");
const doctorAvailabilityRoutes = require("./routes/avaibleRoutes");
const chatRoutes = require("./routes/chatRoutes");
const AppointmentRoutes = require("./routes/AppointmentRoutes");
const esewaRoutes = require("./routes/esewaRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reminderRoutes = require("./routes/reminderRoutes");
const ratingRoutes = require("./routes/rating.routes");
const prescriptionRoutes = require("./routes/prescriptionRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);
app.use("/api", doctorAvailabilityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/appointments", AppointmentRoutes);
app.use("/esewa", esewaRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/rating", ratingRoutes);
app.use("/api/prescription", prescriptionRoutes);
// Test route
app.get("/", (req, res) => res.send("Server is running ✅"));

// Cron Job to clear today's availabilities at 23:59
cron.schedule("59 23 * * *", async () => {
    try {
        // 1️⃣ Clear doctor availabilities
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const result = await DoctorAvailability.deleteMany({
            date: { $gte: today, $lt: tomorrow },
        });
        console.log(`Cleared ${result.deletedCount} doctor availability slots for today ✅`);

        // 2️⃣ Remove prescription notes older than 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const notesResult = await Prescription.updateMany(
            { notes: { $exists: true }, createdAt: { $lte: twentyFourHoursAgo } },
            { $unset: { notes: "" } }
        );
        console.log(`Expired notes removed: ${notesResult.modifiedCount}`);

    } catch (err) {
        console.error("Error in cron job:", err.message);
    }
});

module.exports = app;

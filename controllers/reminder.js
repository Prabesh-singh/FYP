const cron = require("node-cron");
const Appointment = require("../models/Appointment");
const Notification = require("../models/Notification");
const moment = require("moment-timezone");
let getIO;
try {
    getIO = require("../socket").getIO;
} catch (err) {
    console.warn("⚠️ Socket.io not found, realtime notifications will not work.");
}

/**
 * Send reminders for appointments in the next 30 minutes
 */
async function sendUpcomingReminders(req, res) {
    try {
        const nowNepal = moment().tz("Asia/Kathmandu");
        const in30Nepal = nowNepal.clone().add(30, "minutes");

        const appointments = await Appointment.find({
            scheduledAt: { $gte: nowNepal.toDate(), $lte: in30Nepal.toDate() },
            status: "Confirmed",
            reminderSent: { $ne: true },
        });

        if (!appointments.length) {
            if (res) return res.json({ success: true, message: "No upcoming appointments in 30 minutes" });
            return;
        }

        let io;
        if (getIO) {
            try {
                io = getIO();
            } catch (err) {
                console.warn("⚠️ Socket.io instance not initialized", err.message);
            }
        }

        for (let appointment of appointments) {
            // USER notification
            const userNoti = new Notification({
                receiverId: appointment.userId,
                receiverRole: "user",
                title: "Appointment Reminder",
                message: `Your appointment is in 30 minutes at ${moment(appointment.scheduledAt).tz("Asia/Kathmandu").format("hh:mm A")}.`,
                appointmentId: appointment._id,
                isRead: false,
            });
            await userNoti.save();
            if (io && appointment.userId) io.to(appointment.userId.toString()).emit("newNotification", userNoti);

            // DOCTOR notification
            const doctorNoti = new Notification({
                receiverId: appointment.doctorId,
                receiverRole: "doctor",
                title: "Appointment Reminder",
                message: `You have an appointment in 30 minutes at ${moment(appointment.scheduledAt).tz("Asia/Kathmandu").format("hh:mm A")}.`,
                appointmentId: appointment._id,
                isRead: false,
            });
            await doctorNoti.save();
            if (io && appointment.doctorId) io.to(appointment.doctorId.toString()).emit("newNotification", doctorNoti);

            // Mark as sent
            appointment.reminderSent = true;
            await appointment.save();
        }

        if (res) return res.json({ success: true, message: `You have ${appointments.length} reminders sent` });

    } catch (err) {
        console.error("❌ Reminder error:", err);
        if (res) return res.status(500).json({ success: false, message: "Server error", error: err.message });
    }
}

// Cron job
cron.schedule("* * * * *", () => {
    sendUpcomingReminders();
    console.log("✅ Reminder cron executed at", moment().tz("Asia/Kathmandu").format());
});

module.exports = { sendUpcomingReminders };

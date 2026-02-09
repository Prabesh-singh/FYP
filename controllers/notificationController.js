const Notification = require("../models/Notification");

// Get all notifications + unread count
exports.getUserNotifications = async (req, res) => {
    try {
        const userId = req.params.userId;

        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 });

        const unreadCount = await Notification.countDocuments({
            userId,
            isRead: false,
        });

        res.json({ notifications, unreadCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
    try {
        const userId = req.params.userId;

        await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );

        res.json({ message: "All notifications marked as read" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ---------------------------------
exports.createMedicineNotification = async ({ patientId, doctorName }) => {
    try {
        const notification = await Notification.create({
            userId: patientId,
            title: "New Prescription Added 💊",
            message: `${doctorName} has added new medicines. Please check.`,
            type: "PRESCRIPTION",
        });

        return notification;
    } catch (error) {
        console.error("Create Medicine Notification Error:", error.message);
        return null;
    }
};

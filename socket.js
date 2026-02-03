const Appointment = require("./models/Appointment");
const Message = require("./models/Message");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // --- JOIN ROOM ---
        socket.on("join_room", async ({ roomId, userId, senderRole }) => {
            console.log("JOIN DATA:", { roomId, userId, senderRole });

            if (!roomId || !userId || !senderRole) {
                return socket.emit("chat_error", "Invalid join data");
            }

            try {
                const appointment = await Appointment.findById(roomId);
                if (!appointment) return socket.emit("chat_error", "Invalid room");

                const allowedUsers = [
                    appointment.userId.toString(),
                    appointment.doctorId.toString(),
                ];

                if (!allowedUsers.includes(userId)) {
                    return socket.emit("chat_error", "Not authorized");
                }

                socket.join(roomId);
                socket.userId = userId;
                socket.role = senderRole;

                console.log(`✅ ${senderRole.toUpperCase()} ${userId} joined room ${roomId}`);

                socket.to(roomId).emit("user_joined", { userId, role: senderRole });
            } catch (err) {
                console.error("Join Error:", err);
            }
        });

        // --- SEND MESSAGE (FIXED VERSION) ---
        socket.on("send_message", async ({ roomId, senderId, senderRole, text }) => {
            if (!text?.trim()) return;

            try {
                // 1. FIX: Translate 'user' to 'patient' to match your Mongoose Schema Enum
                let dbRole = senderRole;
                if (senderRole === "user") {
                    dbRole = "patient";
                }

                // 2. Save to Database
                const message = await Message.create({
                    roomId,
                    senderId,
                    senderRole: dbRole, // Use the fixed role
                    text: text.trim(),
                });

                // 3. Emit to everyone in the room
                io.to(roomId).emit("receive_message", message);
                console.log("📩 Message sent and saved to DB");

            } catch (err) {
                // This catch block prevents the server from crashing!
                console.error("❌ DB SAVE ERROR:", err.message);
                socket.emit("chat_error", "Could not save message");
            }
        });

        socket.on("typing", ({ roomId }) => {
            socket.to(roomId).emit("typing");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};
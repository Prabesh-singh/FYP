const Appointment = require("./models/Appointment");
const Message = require("./models/Message");

module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // JOIN ROOM
        socket.on("join_room", async ({ roomId, userId, senderRole }) => {
            console.log("JOIN DATA:", { roomId, userId, senderRole });

            if (!roomId || !userId || !senderRole) {
                return socket.emit("chat_error", "Invalid join data");
            }

            try {
                const appointment = await Appointment.findById(roomId)
                    .populate("userId")
                    .populate("doctorId");

                if (!appointment) return socket.emit("chat_error", "Invalid room");

                const allowedUsers = [
                    appointment.userId._id.toString(),
                    appointment.doctorId._id.toString(),
                ];

                if (!allowedUsers.includes(userId)) {
                    return socket.emit("chat_error", "Not authorized");
                }

                socket.join(roomId);

                socket.userId = userId;
                socket.role = senderRole;

                console.log(`${senderRole.toUpperCase()} ${userId} joined room ${roomId}`);

                // OPTIONAL: notify room when someone joins
                socket.to(roomId).emit("user_joined", {
                    userId,
                    role: senderRole,
                });
            } catch (err) {
                console.error(err);
            }
        });

        // SEND MESSAGE
        socket.on("send_message", async ({ roomId, senderId, senderRole, text }) => {
            if (!text?.trim()) return;

            const message = await Message.create({
                roomId,
                senderId,
                senderRole,
                text,
            });

            io.to(roomId).emit("receive_message", message);
        });

        // TYPING
        socket.on("typing", ({ roomId }) => {
            socket.to(roomId).emit("typing");
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });
};

// require("dotenv").config();
// const http = require("http");
// const { Server } = require("socket.io");
// const connectDB = require("./config/db");
// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// connectDB()
//     .then(() => {
//         const server = http.createServer(app);

//         const io = new Server(server, {
//             cors: { origin: "*", methods: ["GET", "POST"] },
//         });

//         io.on("connection", (socket) => {
//             console.log("User connected:", socket.id);

//             socket.on("send_message", (data) => {
//                 // Optional: check if sender/receiver are in the same appointment
//                 io.emit("receive_message", data);
//             });

//             socket.on("disconnect", () => {
//                 console.log("User disconnected:", socket.id);
//             });
//         });

//         server.listen(PORT, () => {
//             console.log(`Server running on http://localhost:${PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.error("DB connection failed:", err.message);
//         process.exit(1);
//     });


require("dotenv").config();
const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB()
    .then(() => {
        const server = http.createServer(app);

        // Socket.io setup
        const io = new Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] },
        });

        // Make io accessible in controllers
        app.set("io", io);

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            // Doctor joins their private room
            socket.on("joinDoctorRoom", (doctorId) => {
                socket.join(doctorId);
                console.log(`Doctor joined room: ${doctorId}`);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });

        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("DB connection failed:", err.message);
        process.exit(1);
    });

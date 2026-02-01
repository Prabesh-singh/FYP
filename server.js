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


// require("dotenv").config();
// const http = require("http");
// const express = require("express");
// const { Server } = require("socket.io");
// const connectDB = require("./config/db");
// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// connectDB()
//     .then(() => {
//         const server = http.createServer(app);

//         // Socket.io setup
//         const io = new Server(server, {
//             cors: { origin: "*", methods: ["GET", "POST"] },
//         });

//         // Make io accessible in controllers
//         app.set("io", io);

//         io.on("connection", (socket) => {
//             console.log("User connected:", socket.id);

//             // Doctor joins their private room
//             socket.on("joinDoctorRoom", (doctorId) => {
//                 socket.join(doctorId);
//                 console.log(`Doctor joined room: ${doctorId}`);
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


// // server.js
// const http = require("http");
// const dotenv = require("dotenv");
// const mongoose = require("mongoose");
// const { Server } = require("socket.io");

// const app = require("./app");
// const setupSocket = require("./socket"); // your socket.js file

// dotenv.config();

// // MongoDB connection
// mongoose.connect(process.env.mongoose_url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => console.log("MongoDB connected ✅"))
//     .catch(err => console.error("MongoDB connection error:", err));

// // Create HTTP server
// const server = http.createServer(app);

// // Socket.IO setup
// const io = new Server(server, {
//     cors: { origin: "*" }
// });
// setupSocket(io);

// // Start server
// const PORT = process.env.PORT || 8000;
// server.listen(PORT, () => console.log(`Server running on  http://192.168.1.73:${PORT}`));


const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const app = require("./app");
const setupSocket = require("./socket");
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.mongoose_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("MongoDB connected ✅"))
    .catch(err => console.error("MongoDB connection error:", err));

// HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
setupSocket(io);

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on  http://192.168.254.23:${PORT}`));

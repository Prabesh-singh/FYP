// require("dotenv").config();
// const http = require("http");
// const { Server } = require("socket.io");
// const connectDB = require("./config/db");
// const app = require("./app");

// const PORT = process.env.PORT || 5000;

// // Connect to MongoDB first
// connectDB()
//     .then(() => {
//         const server = http.createServer(app); // Create server AFTER DB connected

//         // Socket.io setup
//         const io = new Server(server, {
//             cors: {
//                 origin: "*",
//                 methods: ["GET", "POST"],
//             },
//         });

//         io.on("connection", (socket) => {
//             console.log("User connected:", socket.id);

//             socket.on("send_message", (data) => {
//                 io.emit("receive_message", data); // broadcast
//             });

//             socket.on("disconnect", () => {
//                 console.log("User disconnected:", socket.id);
//             });
//         });

//         server.listen(PORT, () => {
//             console.log(`✅ Server running on http://localhost:${PORT}`);
//         });
//     })
//     .catch((err) => {
//         console.error("❌ DB connection failed:", err.message);
//         process.exit(1); // stop server if DB fails
//     });

require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// Connect to MongoDB first
connectDB()
    .then(() => {
        const server = http.createServer(app);

        // Socket.io setup
        const io = new Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] },
        });

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id);

            socket.on("send_message", (data) => {
                io.emit("receive_message", data); // broadcast to all
            });

            socket.on("disconnect", () => {
                console.log("User disconnected:", socket.id);
            });
        });

        server.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ DB connection failed:", err.message);
        process.exit(1);
    });

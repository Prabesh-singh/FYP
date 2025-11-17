const express = require("express");
const cors = require('cors');
const dotenv = require('dotenv');

const doctorRoutes = require('./routes/doctorRoutes');
const authRoutes = require("./routes/authRoutes");
const doctorAvailabilityRoutes = require("./routes/avaibleRoutes");

dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/doctor", doctorRoutes);  // <-- fixed
app.use("/api", doctorAvailabilityRoutes);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

module.exports = app;

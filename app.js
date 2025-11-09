const express = require("express");
const app = express();
require("dotenv").config();

// Middleware to parse JSON
app.use(express.json());

// Import routes
const authRoutes = require("./routes/authRoutes");

// Use routes with prefix /api/auth
app.use("/api/auth", authRoutes);

// Optional: basic route to test server
app.get("/", (req, res) => {
    res.send("Server is running ✅");
});

module.exports = app;

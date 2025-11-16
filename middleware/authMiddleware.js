const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// Protect user routes
exports.protectUser = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");
        if (!req.user) return res.status(404).json({ message: "User not found" });
        next();
    } else {
        res.status(401).json({ message: "No token, authorization denied" });
    }
});

// Protect doctor routes
exports.protectDoctor = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.doctor = await Doctor.findById(decoded.id).select("-password");
        if (!req.doctor) return res.status(404).json({ message: "Doctor not found" });
        next();
    } else {
        res.status(401).json({ message: "No token, authorization denied" });
    }
});

const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes middleware
const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extract token from "Bearer <token>"
            token = req.headers.authorization.split(" ")[1];

            // Verify token using your secret key
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find the user associated with token (exclude password)
            req.user = await User.findById(decoded.id).select("-password");

            // If user doesn’t exist
            if (!req.user) {
                return res.status(404).json({ message: "User not found" });
            }

            // Move to next middleware or controller
            next();

        } catch (err) {
            console.error("Token verification failed:", err);
            return res.status(401).json({ message: "Invalid or expired token" });
        }
    }

    // If no token provided
    if (!token) {
        return res.status(401).json({ message: "No token, authorization denied" });
    }
};

module.exports = protect;

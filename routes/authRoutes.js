const express = require("express");
const router = express.Router();

const { signup, login, forgotPassword, resetPassword } = require("../controllers/authController");
const { protectUser } = require("../middleware/authMiddleware");

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Protected route example
router.get("/profile", protectUser, (req, res) => {
    res.json({
        message: "Profile fetched successfully",
        user: req.user, // user info comes from middleware
    });
});

module.exports = router;

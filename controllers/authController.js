const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

// ---------------- SIGNUP ----------------
exports.signup = async (req, res) => {
    try {
        const { fullName, email, password, phone, address, dob, gender } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            fullName, email, password: hashedPassword,
            phone, address, dob, gender
        });

        await newUser.save();
        return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

        return res.status(200).json({
            message: "Login successful",
            token,
            user: { id: user._id, fullName: user.fullName, email: user.email }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ---------------- FORGOT PASSWORD (Send OTP) ----------------
exports.forgotPassword = async (req, res) => {
    try {
        let { email } = req.body;

        // Normalize email
        email = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP and expiry
        user.resetOTP = otp;
        user.otpExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        await user.save();

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Smart Healthcare" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset OTP",
            text: `Hello ${user.fullName},\n\nYour OTP for password reset is: ${otp}\nIt is valid for 5 minutes.`
        });

        return res.status(200).json({ message: "OTP sent to email" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ---------------- RESET PASSWORD (Verify OTP) ----------------
// ---------------- RESET PASSWORD (OTP + Email) ----------------
exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        // Validate input
        if (!email || !otp || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Find user
        const user = await User.findOne({ email, resetOTP: otp });
        if (!user) return res.status(400).json({ message: "Invalid OTP or email" });

        // Check OTP expiry
        if (user.otpExpires < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // Hash and save new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Clear OTP fields
        user.resetOTP = null;
        user.otpExpires = null;

        await user.save();

        res.status(200).json({ message: "Password reset successful" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};

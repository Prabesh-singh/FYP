const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

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

// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Generate token
        const resetToken = crypto.randomBytes(20).toString("hex");

        // Hash token and save in DB
        user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Reset URL (frontend page)
        const resetUrl = `http://your-frontend-app.com/reset-password/${resetToken}`;

        // Nodemailer config
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Smart Healthcare" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: "Password Reset Request",
            html: `
                <p>Hello ${user.fullName},</p>
                <p>You requested a password reset for your Smart Healthcare account.</p>
                <p>Click the link below to reset your password (valid for 15 minutes):</p>
                <a href="${resetUrl}" target="_blank">${resetUrl}</a>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: "Password reset email sent!" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto.createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) return res.status(400).json({ message: "Invalid or expired token" });

        const { newPassword } = req.body;
        user.password = await bcrypt.hash(newPassword, 10);

        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        return res.status(200).json({ message: "Password reset successful" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

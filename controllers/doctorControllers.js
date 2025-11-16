const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const asyncHandler = require('express-async-handler');

// helper to sign token
function signToken(doctor) {
    return jwt.sign({ id: doctor._id, email: doctor.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
}

// Register doctor
exports.registerDoctor = async (req, res, next) => {
    try {
        const { name, email, password, specialization, experienceYears, phone, profilePic } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: "Name, email and password required" });

        // Check if email already exists
        const exists = await Doctor.findOne({ email });
        if (exists) return res.status(400).json({ message: "Email already registered" });

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashed = await bcrypt.hash(password, salt);

        // Create doctor
        const doctor = new Doctor({
            name,
            email,
            password: hashed,
            specialization: specialization || "",
            experienceYears: experienceYears || 0,
            phone: phone || "",
            profilePic: profilePic || "",
            ratings: 0,
            numRatings: 0,
        });

        await doctor.save();

        // Sign JWT token
        const token = signToken(doctor);

        // Return token + doctor info (without password)
        res.status(201).json({
            token,
            doctor: {
                id: doctor._id,
                name: doctor.name,
                email: doctor.email,
                specialization: doctor.specialization,
                experienceYears: doctor.experienceYears,
                phone: doctor.phone,
                profilePic: doctor.profilePic,
                ratings: doctor.ratings,
                numRatings: doctor.numRatings,
            },
        });
    } catch (err) {
        next(err);
    }
};

// Login doctor
exports.loginDoctor = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

        const doctor = await Doctor.findOne({ email });
        if (!doctor) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, doctor.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = signToken(doctor);
        res.json({ token, doctor: { id: doctor._id, name: doctor.name, email: doctor.email } });
    } catch (err) {
        next(err);
    }
};

// Get doctor profile
exports.getProfile = async (req, res, next) => {
    try {
        const doctor = req.doctor;
        res.json({ doctor });
    } catch (err) {
        next(err);
    }
};

// Update doctor profile
exports.updateProfile = async (req, res, next) => {
    try {
        const updates = req.body;
        const doctor = await Doctor.findByIdAndUpdate(req.doctor._id, updates, { new: true }).select('-password');
        res.json({ doctor });
    } catch (err) {
        next(err);
    }
};

// Get appointments for doctor
exports.getAppointments = async (req, res, next) => {
    try {
        const doctorId = req.doctor._id;
        const { status } = req.query;
        const filter = { doctorId };
        if (status) filter.status = status;
        const appointments = await Appointment.find(filter).populate('userId', 'name email phone').sort({ scheduledAt: -1 });
        res.json({ appointments });
    } catch (err) {
        next(err);
    }
};

// Accept or update appointment (confirm/reschedule/cancel)
exports.updateAppointmentStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, scheduledAt, rescheduleReason } = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.doctorId) !== String(req.doctor._id)) {
            return res.status(403).json({ message: 'Not authorized to modify this appointment' });
        }

        if (scheduledAt) appointment.scheduledAt = scheduledAt;
        if (rescheduleReason) appointment.rescheduleReason = rescheduleReason;
        if (status) appointment.status = status;

        await appointment.save();
        res.json({ appointment });
    } catch (err) {
        next(err);
    }
};

// Mark sample collected
exports.markSampleCollected = async (req, res, next) => {
    try {
        const { id } = req.params;
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.doctorId) !== String(req.doctor._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        appointment.sampleCollected = true;
        await appointment.save();
        res.json({ appointment });
    } catch (err) {
        next(err);
    }
};

// Add test result
exports.addTestResult = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { testResults } = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.doctorId) !== String(req.doctor._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        appointment.testResults = testResults;
        await appointment.save();
        res.json({ appointment });
    } catch (err) {
        next(err);
    }
};

// Add prescription
exports.addPrescription = async (req, res, next) => {
    try {
        const { id } = req.params; // appointment id
        const { medicines, notes, deliveryRequired } = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.doctorId) !== String(req.doctor._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        appointment.prescription = {
            medicines: Array.isArray(medicines) ? medicines : [],
            notes: notes || '',
            prescribedBy: req.doctor._id
        };

        // If medicine delivery required, update delivery status to Preparing
        if (deliveryRequired) {
            appointment.deliveryStatus = 'Preparing';
        } else {
            appointment.deliveryStatus = 'NotRequired';
        }

        appointment.status = 'Completed'; // optionally mark as completed when prescription given
        await appointment.save();
        res.json({ appointment });
    } catch (err) {
        next(err);
    }
};

// Update delivery status for medicines (Preparing -> Dispatched -> Delivered)
exports.updateDeliveryStatus = async (req, res, next) => {
    try {
        const { id } = req.params; // appointment id
        const { deliveryStatus } = req.body;
        const appointment = await Appointment.findById(id);
        if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
        if (String(appointment.doctorId) !== String(req.doctor._id)) {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (!['Preparing', 'Dispatched', 'Delivered', 'NotRequired'].includes(deliveryStatus)) {
            return res.status(400).json({ message: 'Invalid delivery status' });
        }
        appointment.deliveryStatus = deliveryStatus;
        await appointment.save();
        res.json({ appointment });
    } catch (err) {
        next(err);
    }
};

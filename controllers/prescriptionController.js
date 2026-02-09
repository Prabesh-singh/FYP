const Prescription = require("../models/Prescription");
const NotificationController = require("./notificationController");
const Doctor = require("../models/Doctor");

// -----------------------------
// Add Prescription (Doctor)
// -----------------------------
exports.addPrescription = async (req, res) => {
    try {
        const { doctorId, patientId, appointmentId, medicines, notes } = req.body;
        const io = req.app.get("io");

        if (!doctorId || !patientId || !medicines || medicines.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Doctor, patient and medicines are required",
            });
        }

        const prescription = await Prescription.create({
            doctorId,
            patientId,
            appointmentId,
            medicines,
            notes,
        });

        const doctor = await Doctor.findById(doctorId);

        const notification = await NotificationController.createMedicineNotification({
            patientId,
            doctorName: doctor.name,
        });

        if (io && notification) {
            io.to(patientId.toString()).emit("newNotification", notification);
        }

        res.status(201).json({
            success: true,
            message: "Prescription added successfully",
            prescription,
        });
    } catch (error) {
        console.error("Add Prescription Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// -----------------------------
// Get prescriptions for a patient
// -----------------------------
exports.getPatientPrescriptions = async (req, res) => {
    try {
        const { patientId } = req.query;

        if (!patientId) {
            return res.status(400).json({ success: false, message: "patientId is required" });
        }

        const prescriptions = await Prescription.find({ patientId })
            .populate("doctorId", "name specialization")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, prescriptions });
    } catch (error) {
        console.error("Get Patient Prescriptions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// -----------------------------
// Get prescriptions for a doctor
// -----------------------------
exports.getDoctorPrescriptions = async (req, res) => {
    try {
        const { doctorId } = req.query;

        if (!doctorId) {
            return res.status(400).json({ success: false, message: "doctorId is required" });
        }

        const prescriptions = await Prescription.find({ doctorId })
            .populate("patientId", "name email")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, prescriptions });
    } catch (error) {
        console.error("Get Doctor Prescriptions Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

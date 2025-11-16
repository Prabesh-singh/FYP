const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorControllers');
const { protectDoctor } = require('../middleware/authMiddleware');

// public
router.post('/register', doctorController.registerDoctor);
router.post('/login', doctorController.loginDoctor);

// protected routes
router.get('/profile', protectDoctor, doctorController.getProfile);
router.put('/profile', protectDoctor, doctorController.updateProfile);
router.get("/", getAllDoctors);

// appointments
router.get('/appointments', protectDoctor, doctorController.getAppointments);
router.put('/appointments/:id/status', protectDoctor, doctorController.updateAppointmentStatus);
router.put('/appointments/:id/sample', protectDoctor, doctorController.markSampleCollected);
router.put('/appointments/:id/test-result', protectDoctor, doctorController.addTestResult);

// prescription & delivery
router.post('/appointments/:id/prescription', protectDoctor, doctorController.addPrescription);
router.put('/appointments/:id/delivery', protectDoctor, doctorController.updateDeliveryStatus);

module.exports = router;

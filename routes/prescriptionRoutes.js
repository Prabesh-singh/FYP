const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");


// Doctor adds prescription
router.post(
    "/add",

    prescriptionController.addPrescription
);

// Patient gets prescriptions
router.get(
    "/patient",

    prescriptionController.getPatientPrescriptions
);

// Doctor gets prescriptions
router.get(
    "/doctor",

    prescriptionController.getDoctorPrescriptions
);

module.exports = router;

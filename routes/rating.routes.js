const express = require("express");
const router = express.Router();
const { submitRating, getDoctorReviews } = require("../controllers/rating.controller");

// Submit rating & review
router.post("/", submitRating);

// Get all reviews for a doctor
router.get("/doctor/:doctorId", getDoctorReviews);

module.exports = router;

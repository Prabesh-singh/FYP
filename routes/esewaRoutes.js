const express = require("express");
const { initiatePayment, checkStatus } = require("../controllers/esewaController");

const router = express.Router();

router.post("/initiate", initiatePayment);
router.get("/status/:transactionId/:amount", checkStatus);

module.exports = router;

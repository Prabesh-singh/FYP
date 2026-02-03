const express = require("express");
const router = express.Router();

// Load from env
const MERCHANT_ID = process.env.ESEWA_MERCHANT_ID || "EPAYTEST";

// 1️⃣ Initiate payment — returns form data
router.post("/initiate", (req, res) => {
    const { amount, transactionId } = req.body;

    const form = {
        tAmt: amount,
        amt: amount,
        psc: 0,
        pdc: 0,
        scd: MERCHANT_ID,
        pid: transactionId,
        esewa_payment_url: "https://uat.esewa.com.np/epay/main",
        success_url: req.body.success_url,  // pass from frontend
        failure_url: req.body.failure_url,
        transaction_id: transactionId,
    };

    res.json(form);
});

// 2️⃣ Verify payment — dummy / sandbox (always success)
router.get("/status/:transactionId/:amount", (req, res) => {
    const { transactionId, amount } = req.params;
    res.json({ status: "COMPLETE", amount, ref_id: transactionId });
});

module.exports = router;

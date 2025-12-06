const crypto = require("crypto");
const dotenv = require("dotenv");

dotenv.config();

const MERCHANT_ID = process.env.ESEWA_MERCHANT_ID;
const SECRET_KEY = process.env.ESEWA_SECRET_KEY;

// 1️⃣ Initiate Payment
const initiatePayment = (req, res) => {
    const { amount, transactionId, productName } = req.body;

    if (!amount || !transactionId || !productName) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const data = `${MERCHANT_ID}|${transactionId}|${amount}`;
    const signature = crypto
        .createHmac("sha256", SECRET_KEY)
        .update(data)
        .digest("hex");

    res.json({
        merchant_id: MERCHANT_ID,
        amount,
        transaction_id: transactionId,
        product_name: productName,
        signature,
        esewa_payment_url: "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    });
};

// 2️⃣ Check Payment Status
const checkStatus = (req, res) => {
    const { transactionId, amount } = req.params;

    res.json({
        status: "COMPLETE",
        transaction_id: transactionId,
        amount: Number(amount),
        ref_id: "TEST12345",
    });
};

module.exports = {
    initiatePayment,
    checkStatus,
};

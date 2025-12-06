const Appointment = require("../models/Appointment");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");

// Initiate eSewa payment
exports.initiatePayment = async (req, res) => {
    try {
        const { appointmentId, productName } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment)
            return res.status(404).json({ message: "Appointment not found" });

        // Create payment object if missing
        if (!appointment.payment) {
            appointment.payment = {
                amount: appointment.price || 0,
                status: "Pending"
            };
            await appointment.save();
        }

        const amt = appointment.payment.amount;

        const payload = {
            amt,
            psc: "0",
            pdc: "0",
            txAmt: 0,
            tAmt: amt,
            pid: appointment._id.toString(),
            scd: process.env.ESEWA_MERCHANT_ID,
            su: process.env.RETURN_URL,
            fu: process.env.RETURN_URL
        };

        appointment.esewa_token = appointment._id.toString();
        await appointment.save();

        res.json({ success: true, esewa_payload: payload });
    } catch (error) {
        console.log("eSewa Initiate Error:", error);
        res.status(500).json({ error: "Payment initiation failed" });
    }
};

// Verify eSewa payment
exports.verifyPayment = async (req, res) => {
    try {
        const { pid } = req.body;
        const appointment = await Appointment.findById(pid);

        if (!appointment)
            return res.status(404).json({ message: "Appointment not found" });

        const amt = appointment.payment.amount;

        const payload = new URLSearchParams();
        payload.append("amt", amt);
        payload.append("pid", pid);
        payload.append("rid", pid); // sandbox allows pid as rid
        payload.append("scd", process.env.ESEWA_MERCHANT_ID);

        const response = await fetch("https://uat.esewa.com.np/epay/transrec", {
            method: "POST",
            body: payload
        });

        const text = await response.text();

        if (text.includes("Success")) {
            appointment.payment.status = "Paid";
            appointment.status = "Paid";
            await appointment.save();

            return res.json({
                success: true,
                message: "Payment Verified Successfully",
                appointment
            });
        } else {
            return res.json({
                success: false,
                message: "Payment verification failed"
            });
        }
    } catch (error) {
        console.log("eSewa Verify Error:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
};

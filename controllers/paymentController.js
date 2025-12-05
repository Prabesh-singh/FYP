const fetch = require("node-fetch");
const Appointment = require("../models/Appointment");

// Create Payment URL
exports.createPayment = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointment = await Appointment.findById(appointmentId);

        if (!appointment)
            return res.status(404).json({ success: false, message: "Appointment not found" });

        const esewaURL = `https://uat.esewa.com.np/epay/main?amt=${appointment.payment.amount}&pdc=0&psc=0&txAmt=0&tAmt=${appointment.payment.amount}&pid=${appointment._id}&scd=EPAYTEST&su=http://localhost:8000/api/payments/success&fu=http://localhost:8000/api/payments/failed`;

        res.json({ success: true, url: esewaURL });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { amt, pid, scd, rid } = req.body;

        if (!amt || !pid || !scd)
            return res.status(400).json({ success: false, message: "Missing required fields" });

        const params = new URLSearchParams();
        params.append("amt", amt);
        params.append("scd", scd);
        params.append("pid", pid);
        if (rid) params.append("rid", rid);

        const response = await fetch("https://uat.esewa.com.np/epay/transrec", {
            method: "POST",
            body: params
        });

        const text = await response.text();

        if (text.includes("<response_code>Success</response_code>")) {
            await Appointment.findByIdAndUpdate(pid, {
                "payment.status": "Success",
                status: "Confirmed"
            });
            return res.json({ success: true, message: "Payment verified successfully" });
        } else {
            await Appointment.findByIdAndUpdate(pid, {
                "payment.status": "Failed"
            });
            return res.json({ success: false, message: "Payment failed" });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

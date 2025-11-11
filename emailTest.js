require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "your_email@gmail.com", // your email to receive the test
    subject: "Test Email",
    text: "This is a test email from Smart Healthcare backend!"
}, (err, info) => {
    if (err) console.log("Error:", err);
    else console.log("Email sent:", info.response);
});

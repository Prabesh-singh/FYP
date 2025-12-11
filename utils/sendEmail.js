const nodemailer = require("nodemailer");

exports.sendEmail = async (to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "yourEmail@gmail.com",
            pass: "your-app-password", // Use App Password
        },
    });

    await transporter.sendMail({
        from: "yourEmail@gmail.com",
        to,
        subject,
        text,
    });
};

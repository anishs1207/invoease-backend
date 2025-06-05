import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export async function sendVerificationEmail(email, verificationCode) {
    console.log("Using:", process.env.EMAIL, process.env.EMAIL_PASS); 

    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASS,
        },
    });

    let mailOptions = {
        from: `Anish <${process.env.EMAIL}>`,
        to: email, // Replace with recipient's email
        subject: "InvoEase: Verification Code",
        text: `Verification Code: ${verificationCode}`,
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

console.log("Sending mail...");
console.log("Mail Sent.");

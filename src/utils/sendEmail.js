import { info } from 'console';
import nodemailer from 'nodemailer'

export const sendEmail = async (to, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.ADMIN_EMAIL_ID,
                pass: process.env.ADMIN_EMAIL_PASSWORD
            }
        });

        const mailOptions = {
            from: process.env.ADMIN_EMAIL_ID,
            to,
            subject,
            text
        }
        await transporter.sendMail(mailOptions);
        console.log('Email sent')
        console.log("Email sent successfully:", info);
        console.log("Message ID:", info.messageId);
        console.log("Accepted Recipients:", info.accepted);
        console.log("Rejected Recipients:", info.rejected);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
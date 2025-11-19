// lib/nodemailer.js
import nodemailer from "nodemailer";

// 1. Transporter ko sirf ek baar file k top par banayein
// Yeh credentials aapki .env.local file se ayengy
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587, // Default port 587 agar env mein na ho
  secure: process.env.EMAIL_SECURE === "true", // true agar port 465 hai
  auth: {
    user: process.env.EMAIL_USER, // Aapka email username (e.g., Gmail)
    pass: process.env.EMAIL_PASS, // Aapka email password (e.g., App Password)
  },
});

/**
 * Yeh hamara main email bhejne wala function hai.
 * @param {object} options - Email options
 * @param {string} options.to - Email kis ko bhejna hai
 * @param {string} options.subject - Email ka subject
 * @param {string} options.html - Hamara banaya hua HTML template
 */
export async function sendEmail({ to, subject, html }) {
  // .env se 'From' name aur email lao
  // Agar .env mein nahi hai, toh default istemal karo
  const fromName = process.env.EMAIL_FROM_NAME || "Booking Support";
  // 'From' email aksar 'user' email hi hota hai
  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;

  try {
    // 2. Email bhejne k options tayyar karein
    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: to,
      subject: subject,
      html: html,
    };

    // 3. Email Bhejein
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // Error ko return karein taakeh API ko pata chalay
    return { success: false, error: error.message };
  }
}
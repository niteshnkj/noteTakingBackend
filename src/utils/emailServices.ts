import nodemailer, { Transporter } from "nodemailer";

export const sendOTP = async (emailId: string, otp: string) => {
  if (!process.env.NODEMAILER_USER || !process.env.NODEMAILER_PASSWORD) {
    throw new Error(
      "Nodemailer configuration is missing in environment variables"
    );
  }

  const transporter: Transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.NODEMAILER_USER,
      pass: process.env.NODEMAILER_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.NODEMAILER_USER, // sender address
      to: emailId, // dynamic recipient email
      subject: "Your One-Time Password (OTP)",
      text: `Hi,

We received a request to verify your email address. Please use the following One-Time Password (OTP) to complete your verification:
${otp}


This code is valid for the next 10 minutes. Please do not share this code with anyone.

If you did not request this, you can safely ignore this email.

Thank you,
Your Company Name`, // plain text body
      html: `<div>
        <p>Hi,</p>
        <p>We received a request to verify your email address. Please use the following One-Time Password (OTP) to complete your verification:</p>
        <h2>${otp}</h2>
        <p>This code is valid for the next <strong>10</strong> minutes. Please do not share this code with anyone.</p>
        <p>If you did not request this, you can safely ignore this email.</p>
        <p>Thank you,<br>Your Company Name</p>
      </div>`, // HTML body
    });

    console.log(`Email sent: ${info.messageId}`);
  } catch (error: any) {
    console.error(`Error sending email: ${error.message}`);
  }
};

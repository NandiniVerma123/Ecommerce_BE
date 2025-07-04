const nodemailer = require("nodemailer");
const User = require("../src/models/user");
require("dotenv").config();

// 1. Send Welcome Email
const sendWelcomeEmail = async (receiverEmail, name = "User") => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW,
    },
  });

  const mailOptions = {
    from: {
      name: "E-Commerce Support",
      address: process.env.EMAIL_USER,
    },
    to: receiverEmail,
    subject: "Welcome to Our E-Commerce Website!",
    text: `Hi ${name},\n\nWelcome to our website! We're excited to have you with us.\n\nHappy Shopping!\n\n- The E-Commerce Team`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Welcome to Our E-Commerce Website!</h2>
        <p>Hi ${name},</p>
        <p>We're thrilled to have you onboard. 🎉</p>
        <p>Start exploring products and enjoy a seamless shopping experience.</p>
        <br/>
        <p>Best Regards,<br>The E-Commerce Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Welcome email sent to:", receiverEmail);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};


// 2. Check if User Exists (by email or phone)
const userExists = async (emailOrPhone) => {
  const user = await User.findOne({
    $or: [{ email: emailOrPhone }, { phone_no: emailOrPhone }],
  });
  return !!user;
};

// 3. Send Password Reset Email
const sendPasswordResetEmail = async (receiverEmail, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PW,
    },
  });

  const mailOptions = {
    from: {
      name: "E-Commerce Support",
      address: process.env.EMAIL_USER,
    },
    to: receiverEmail,
    subject: "Password Reset Request",
    text: `You requested a password reset.\n\nClick the link below to reset your password:\n${resetLink}\n\nIf you did not request this, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetLink}" style="color: #1976d2;">Reset your password</a>
        </p>
        <p>If you did not request this, please ignore this email.</p>
        <br/>
        <p>Best Regards,<br>The E-Commerce Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent to:", receiverEmail);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
  }
};

module.exports = {
  sendWelcomeEmail,
  userExists,
  sendPasswordResetEmail
}

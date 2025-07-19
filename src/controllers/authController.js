const { userExists, sendWelcomeEmail, sendPasswordResetEmail } = require('../../utils/helperFunc.js');
require("dotenv").config();
const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CUSTOMER, VENDOR, ADMIN } = require('../../utils/constants.js');
const { passwordGenerator } = require('../../utils/passwordGenerator.js');

let blacklist = []; // In-memory blacklist

const isTokenBlacklisted = (token) => blacklist.includes(token);

// Sign Up
const signUp = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      city,
      street,
      postalCode,
      country
    } = req.body;

    if (await userExists(email)) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate random password if not provided
    const generatedPassword = password || passwordGenerator(); // fallback to generator
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || CUSTOMER,
      address,
      city,
      street,
      postalCode,
      country
    });

    await user.save();

    // Send email with the password
    await sendWelcomeEmail(
      email,
      name,
      `Welcome to our platform!\n\nYour login credentials:\nEmail: ${email}\nPassword: ${generatedPassword}\n\nPlease change your password after logging in.`
    );

    res.status(201).json({ message: "User registered successfully. Password sent via email." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Sign In
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sign Out
const signOut = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    blacklist.push(token);
  }
  res.status(200).json({ message: "Signed out successfully" });
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate a short-lived reset token
    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Send a password reset link to the user's email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    await sendPasswordResetEmail(email, resetLink);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
  const { userId, newPassword, resetToken } = req.body;

    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(400).json({ message: "Token has been invalidated" });
    }

    // Verify the reset token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Update the user's password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  signUp,
  signIn,
  signOut,
  forgotPassword,
  resetPassword
};


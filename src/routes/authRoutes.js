const express = require('express');
const { signUp, signIn, signOut, forgotPassword, resetPassword } = require('../controllers/authController');
const router = express.Router();

router.post('/signup', signUp);
router.post('/signin', signIn);
router.post('/signout', signOut);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// The token is generated in the signIn controller (authController.js) using jwt.sign()
// It is returned in the response when a user successfully signs in.

// Example (in signIn):
// const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
// res.status(200).json({ token, user: { ... } });

module.exports = router;
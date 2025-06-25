const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const blacklist = require('../controllers/authController').blacklist; // Import the blacklist

const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.',
    });
  }

  // Check if the token is blacklisted
  if (blacklist.includes(token)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const decodedUser = decoded;
    const user = await User.findById(decodedUser.id);
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Invalid token.',
    });
  }
};

module.exports = authenticate;
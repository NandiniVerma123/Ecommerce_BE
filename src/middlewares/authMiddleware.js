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

  // Check if the token is blacklisted (with error handling)
  try {
    if (blacklist && blacklist.includes && blacklist.includes(token)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
    }
  } catch (error) {
    console.error('Blacklist check error:', error);
    // Continue without blacklist check if there's an issue
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('🔍 Decoded JWT:', decoded);
    console.log('🔍 User ID from token:', decoded.id);
    console.log('🔍 Token exp:', new Date(decoded.exp * 1000));
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }
    
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
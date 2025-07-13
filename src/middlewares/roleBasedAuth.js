const authenticate = require('./authMiddleware');
const { ADMIN, CUSTOMER, VENDOR } = require("../../utils/constants.js");

// Combined auth + role middleware
const roleAuth = (allowedRoles = []) => {
  return async (req, res, next) => {
    // First run authentication
    await new Promise((resolve, reject) => {
      authenticate(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    }).catch(() => {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed.',
      });
    });

    // Then check role
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient role.',
      });
    }
    next();
  };
};

// Prebuilt specific role-based middlewares
const adminAuth = roleAuth([ADMIN]);
const customerAuth = roleAuth([CUSTOMER]);
const vendorAuth = roleAuth([VENDOR]);

module.exports = { adminAuth, customerAuth, vendorAuth, roleAuth };
const User = require("../models/user");

const adminGetUsers = (req, res, next) => {
    // If no role is specified in the query, default to "customer,vendor"
    if (!req.query.role) {
        req.query.role = 'customer,vendor';
    }

    const roles = req.query.role.toString().split(',');

    // Block attempts to fetch users with "admin" role
    if (roles.includes('admin')) {
        return res.status(403).json({
            success: false,
            message: "Unauthorized to view admin user data"
        });
    }

    next();
};

const adminDeleteOrUpdateUser = async (req, res, next) => {
    try {
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const isSelf = req.user._id.toString() === targetUser._id.toString();
        const isAdmin = req.user.role === "admin";

        // Only self or admin can modify/delete
        if (!isSelf && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized to modify or delete this user"
            });
        }

        // Prevent non-admins from modifying/deleting admin accounts
        if (targetUser.role === "admin" && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only admins can modify admin accounts"
            });
        }

        next();
    } catch (error) {
        console.error("Error in adminDeleteOrUpdateUser:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};
module.exports = {
    adminGetUsers,
    adminDeleteOrUpdateUser
};
const User = require("../models/user");
const bcrypt = require("bcrypt");

// Get user(s) with filters — accessible by Admin & Vendor
const getUser = async (req, res) => {
  try {
    const {
      id,
      email,
      name,
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      order = "desc"
    } = req.body;

    const userRole = req.user?.role;

    if (userRole === "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = {};

    if (userRole === "vendor") {
      filter.role = "customer"; // vendor can only access customers
    }

    if (id) filter._id = id;
    if (email) filter.email = email;
    if (name) filter.name = { $regex: name, $options: "i" };

    const users = await User.find(filter)
      .sort({ [sortBy]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({
      users,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      total
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users — Admin only
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied: Admins only",
      });
    }

    const filters = { ...req.query };
    const page = parseInt(filters.page) || 1;
    const limit = parseInt(filters.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query filters
    let queryFilters = {};

    // Optional: school_id filter (if multi-school admin panel)
    if (filters.school_id) {
      queryFilters.school_id = filters.school_id;
    }

    // Role filter (support multiple comma-separated roles)
    if (filters.role) {
      if (typeof filters.role === "string") {
        queryFilters.role = {
          $in: filters.role.split(",").map(role => new RegExp(`^${role}$`, "i")),
        };
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid role filter format. Must be comma-separated string.",
        });
      }
    }

    // Status filter (e.g., active/inactive)
    if (filters.status) {
      queryFilters.status = filters.status;
    }

    // Search filter (by name or email)
    if (filters.search) {
      queryFilters.$or = [
        { name: { $regex: filters.search, $options: "i" } },
        { email: { $regex: filters.search, $options: "i" } },
      ];
    }

    const users = await User.find(queryFilters)
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments(queryFilters);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        totalUsers,
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Error retrieving users",
      error: err.message,
    });
  }
};

// Add new user — Admin only
const addNewUser = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const {
      name,
      email,
      phone,
      password,
      address,
      role = "customer",
      city,
      postalCode,
      street,
      country,
      status = "activate"
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      address,
      role,
      city,
      postalCode,
      street,
      country,
      status
    });

    await newUser.save();
    res.status(201).json({ message: "User added successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user by ID — Admin only
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: err.message,
    });
  }
};

// Update user details by ID — Admin only
const updateUserDetails = async (req, res) => {
  try {
    const userId = req.params.id || req.user._id;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID format',
      });
    }

    const user = await User.findById(userId); 

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found',
      });
    }

    const updates = Object.keys(req.body);

    updates.forEach((update) => {
      user[update] = req.body[update];
    });

    await user.save();

    const updatedUser = await User.findById(userId); 

    res.status(200).json({
      success: true,
      message: 'User details updated successfully',
      data: updatedUser, // Return the populated user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error updating user details',
      error: err.message,
    });
  }
};

// Get current logged-in user's profile
const getMyProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password — logged-in user
const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Missing userId, oldPassword, or newPassword" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Toggle user status (activate/deactivate) — Admin only

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // expected: "activate" or "deactivate"
    const adminId = req.query.adminId;

    // Check if status is valid
    if (!["activate", "deactivate"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'activate' or 'deactivate'" });
    }

    // Validate userId
    if (!userId) {
      return res.status(400).json({ message: "User ID is required in params" });
    }

    // Check if request is coming from an admin (assume verification is handled elsewhere)
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent admin from disabling another admin
    if (user.role === "admin") {
      return res.status(403).json({ message: "Cannot change status of another admin" });
    }

    user.status = status;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name}'s status updated to ${status}`,
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        status: user.status
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


module.exports = {
  getUser,
  getAllUsers,
  deleteUser,
  updateUserDetails,
  addNewUser,
  getMyProfile,
  changePassword,
  toggleUserStatus
};

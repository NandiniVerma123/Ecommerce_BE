const User = require("../models/user");

const getUser = async (req, res) => {
  try {
    const { id, email, name, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc' } = req.body;
    const userRole = req.user?.role; // assume JWT middleware populates `req.user`

    // Role-based restriction
    if (userRole === "customer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const filter = {};

    // Role filter logic
    if (userRole === "vendor") {
      filter.role = "customer";
    }

    // Field filters
    if (id) {
      filter._id = id;
    }
    if (email) {
      filter.email = email;
    }
    if (name) {
      filter.name = { $regex: name, $options: "i" }; // name filter for dropdown
    }

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

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const users = await User.find({});
    res.status(200).json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete user by id (admin only)
const deleteUser = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user details by id (admin only)
const updateUserDetails = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { id } = req.params;
    const update = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add new user (admin only)
const addNewUser = async (req, res) => {
  try {
    const userRole = req.user?.role;
    if (userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { name, email, password, role, phone, addresses } = req.body;
    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await require('bcrypt').hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "customer",
      phone,
      addresses,
    });
    await user.save();
    res.status(201).json({ message: "User added successfully", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current user's profile (for any logged-in user)
const getMyProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Change password (for any logged-in user)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await require('bcrypt').compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    user.password = await require('bcrypt').hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
};



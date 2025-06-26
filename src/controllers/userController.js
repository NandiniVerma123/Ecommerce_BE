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



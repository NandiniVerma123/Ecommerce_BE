const Product = require("../models/product");

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { name, createdBy, role } = req.body;

    if (!createdBy || !role) {
      return res.status(400).json({ success: false, message: "Role and CreatedBy (User ID) are required." });
    }

    if (role !== "vendor" && role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const product = new Product({
      ...req.body,
      name: name?.trim(),
      createdBy: createdBy.trim(),
    });

    await product.save();

    return res.status(201).json({ success: true, message: "Product added successfully.", product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a product by ID
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "User ID and role are required." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(205).json({ success: false, message: "Product not found." });
    }

    const isOwner = product.createdBy?.toString() === userId;

    if (role !== "admin" && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Product deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update a product by ID
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.query;

    if (!userId || !role) {
      return res.status(400).json({ success: false, message: "User ID and role are required." });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(205).json({ success: false, message: "Product not found." });
    }

    const isOwner = product.createdBy?.toString() === userId;

    if (role !== "admin" && !isOwner) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({ success: true, message: "Product updated successfully.", product: updatedProduct });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all products with pagination
const getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const products = await Product.find({})
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments({});

    if (products.length === 0) {
      return res.status(205).json({ success: false, message: "No products found." });
    }

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
};

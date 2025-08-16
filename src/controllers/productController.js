const Product = require("../models/products");

// Add a new product
const addProduct = async (req, res) => {
  try {
    const {
      productName,
      description,
      category,
      productImage,
      pricing,
      originalPricing,
      inventory,
      stockQuantity,
      sku,
      brand,
      tags
    } = req.body;

    // Validate required fields
    if (!productName || !description || !category || !productImage || !pricing || inventory == null || stockQuantity == null) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: productName, description, category, productImage, pricing, inventory, stockQuantity."
      });
    }

    const product = new Product({
      productName: productName.trim(),
      description,
      category,
      productImage: Array.isArray(productImage) ? productImage : [productImage],
      pricing,
      originalPricing,
      inventory,
      stockQuantity,
      sku,
      brand,
      tags,
      createdBy: req.user._id
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product
    });

  } catch (error) {
    console.error("Error adding product:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while adding the product.",
      error: error.message
    });
  }
};

// Delete product
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    if (product.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Unauthorized: Cannot delete this product' });
    }

    await Product.findByIdAndDelete(productId);
    res.status(200).json({ success: true, message: 'Product deleted successfully' });

  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    const isOwner = product.createdBy?.toString() === req.user.id;
    const role = req.user?.role;

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
      return res.status(204).json({ success: false, message: "No products found." });
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

// Get product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const products = await Product.find({ category: categoryId });
    if (products.length === 0) {
      return res.status(204).json({ success: false, message: "No products found for this category." });
    }
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ success: false, message: "Keyword is required" });

    const products = await Product.find({
      productName: { $regex: keyword, $options: "i" }
    });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Filter products
const filterProducts = async (req, res) => {
  try {
    const { minPrice, maxPrice, available } = req.query;
    const filter = {};

    if (minPrice) filter.pricing = { ...filter.pricing, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.pricing = { ...filter.pricing, $lte: parseFloat(maxPrice) };
    if (available) filter.stockQuantity = { $gt: 0 };

    const products = await Product.find(filter);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Upload product image
const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({ success: true, imageUrl });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle product status
const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, message: "Product not found." });

    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    return res.status(200).json({ success: true, message: `Product status changed to ${product.status}.`, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get my products
const getMyProducts = async (req, res) => {
  try {
    const userId = req.user._id;
    const products = await Product.find({ createdBy: userId });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  uploadProductImage,
  toggleProductStatus,
  getMyProducts,
  getProductById
};

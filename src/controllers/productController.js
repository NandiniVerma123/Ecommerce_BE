const Product = require("../models/products");

// Add a new product
const addProduct = async (req, res) => {
  try {
    const { productName, category, total } = req.body;

    // Validate required fields
    if (!productName || !total) {
      return res.status(400).json({
        success: false,
        message: "productName and total are required."
      });
    }

    // Create and save product
    const product = new Product({
      productName: productName.trim(),
      category,
      total
    });

    await product.save();

    return res.status(201).json({
      success: true,
      message: "Product added successfully.",
      product: {
        _id: product._id,
        productName: product.productName,
        category: product.category,
        total: product.total
      }
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

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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

const searchProducts = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ success: false, message: "Keyword is required" });

    const products = await Product.find({ name: { $regex: keyword, $options: "i" } });

    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const filterProducts = async (req, res) => {
  try {
    const { minPrice, maxPrice, rating, available } = req.query;
    const filter = {};

    if (minPrice) filter.price = { ...filter.price, $gte: parseFloat(minPrice) };
    if (maxPrice) filter.price = { ...filter.price, $lte: parseFloat(maxPrice) };
    if (rating) filter.rating = { $gte: parseFloat(rating) };
    if (available) filter.stock = { $gt: 0 };

    const products = await Product.find(filter);
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

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


const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    product.status = product.status === "active" ? "inactive" : "active";
    await product.save();

    return res.status(200).json({ success: true, message: `Product status changed to ${product.status}.`, product });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

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

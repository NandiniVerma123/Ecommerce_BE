const Product = require("../models/product");

// Add product by the user (vendor or admin)
const addProductByTheUser = async (req, res) => {
  try {
    // Use role from req.params instead of req.user?.role
    const userRole = req.params.role;
    if (userRole !== "vendor" && userRole !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const productData = req.body;
    productData.createdBy = req.user.userId;
    const product = new Product(productData);
    await product.save();
    res.status(201).json({ message: "Product added successfully", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete product by the user (vendor or admin)
const deleteProductByTheUser = async (req, res) => {
  try {
    const userRole = req.params.role;
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only admin or the vendor who created the product can delete
    if (userRole !== "admin" && (!product.createdBy || product.createdBy.toString() !== req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update product by the user (vendor or admin)
const updateProductByTheUser = async (req, res) => {
  try {
    const userRole = req.params.role;
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Only admin or the vendor who created the product can update
    if (userRole !== "admin" && (!product.createdBy || product.createdBy.toString() !== req.user.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updatedProduct });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products (public)
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addProductByTheUser,
  deleteProductByTheUser,
  updateProductByTheUser,
  getAllProducts,
};

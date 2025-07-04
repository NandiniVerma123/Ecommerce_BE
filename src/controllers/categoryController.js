const Category = require("../models/category");

// Create a new category
const createCategory = async (req, res) => {
  try {
    const { name, subcategories = [] } = req.body;
    if (await Category.findOne({ name })) {
      return res.status(400).json({ message: "Category already exists" });
    }
    const category = new Category({ name, subcategories });
    await category.save();
    res.status(201).json({ message: "Category created", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ categories });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single category by id
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a category by id
const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subcategories } = req.body;
    const category = await Category.findByIdAndUpdate(
      id,
      { name, subcategories },
      { new: true }
    );
    if (!category) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category updated", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a category by id
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Category not found" });
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a subcategory to a category
const addSubcategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    if (category.subcategories.some(sub => sub.name === name)) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }
    category.subcategories.push({ name });
    await category.save();
    res.status(200).json({ message: "Subcategory added", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove a subcategory from a category
const removeSubcategory = async (req, res) => {
  try {
    const { id, subId } = req.params;
    const category = await Category.findById(id);
    if (!category) return res.status(404).json({ message: "Category not found" });
    category.subcategories = category.subcategories.filter(
      sub => sub._id.toString() !== subId
    );
    await category.save();
    res.status(200).json({ message: "Subcategory removed", category });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory,
};

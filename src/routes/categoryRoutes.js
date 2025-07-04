const express = require('express');
const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory
} = require('../controllers/CategoryController');
const router = express.Router();

// Create a new category
router.post('/createCategory', createCategory);

// Get all categories
router.get('/getAllCategories', getAllCategories);

// Get a single category by id
router.get('/getCategoryById/:id', getCategoryById);

// Update a category by id
router.put('/updateCategory/:id', updateCategory);

// Delete a category by id
router.delete('/deleteCategory/:id', deleteCategory);

// Add a subcategory to a category
router.post('/addSubcategory/:id', addSubcategory);

// Remove a subcategory from a category
router.delete('/removeSubcategory/:id/:subId', removeSubcategory);

module.exports = router;

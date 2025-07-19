const express = require('express');
const authenticate = require('../middlewares/authMiddleware'); // Add this import
const { adminAuth } = require('../middlewares/roleBasedAuth');
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

// Apply authentication first, then role-based authorization
router.use(authenticate);  // ✅ First authenticate and set req.user
router.use(adminAuth);     // ✅ Then check if user has admin role

// Category endpoints
router.get("/getallcategories", getAllCategories);
router.post("/create_categories", createCategory);
router.get("/getcategory/:categoryId", getCategoryById);
router.put("/updatecategory/:categoryId", updateCategory);
router.delete("/deletecategory/:categoryId", deleteCategory);
router.post("/addsubcategory/:categoryId", addSubcategory);
router.delete("/removesubcategory/:categoryId/:subId", removeSubcategory);

module.exports = router;
const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
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
router.get("/categories", getAllCategories);
router.post("/create_categories", createCategory);
router.get("/categories/:id", getCategoryById);
router.put("/categories/:id", updateCategory);
router.delete("/categories/:id", deleteCategory);
router.post("/categories/:id/subcategories", addSubcategory);
router.delete("/categories/:id/subcategories/:subId", removeSubcategory);

module.exports = router;
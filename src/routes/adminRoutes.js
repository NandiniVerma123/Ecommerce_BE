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
router.get("/getAllcategories", getAllCategories);
router.post("/create_categories", createCategory);
router.get("/getcategory/:id", getCategoryById);
router.put("/update_categories/:id", updateCategory);
router.delete("/delete_categories/:id", deleteCategory);
router.post("/addsubcategory/:id", addSubcategory);
router.delete("/removesubcategory/:id/:subId", removeSubcategory);

module.exports = router;
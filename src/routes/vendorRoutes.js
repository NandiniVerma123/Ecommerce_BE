const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { vendorAuth } = require('../middlewares/roleBasedAuth');


const {
  addProduct,
  deleteProduct,
  updateProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  searchProducts,
  filterProducts,
  uploadProductImage,
  toggleProductStatus,
  getMyProducts
} = require('../controllers/productController');

const router = express.Router();

// ---------------- Middleware ----------------
router.use(authenticate);  // ✅ Authenticate every request first
router.use(vendorAuth);     // ✅ Then only allow vendors



// ---------------- Product Routes ----------------
router.post("/addProduct", addProduct);
router.delete("/deleteProduct/:id", deleteProduct);
router.put("/updateProduct/:id", updateProduct);
router.get("/getAllProducts", getAllProducts);
router.get("/getProduct/:id", getProductById);
router.get("/getProductsByCategory/:categoryId", getProductsByCategory);
router.get("/searchProducts", searchProducts);        
router.get("/filterProducts", filterProducts);      
router.post("/uploadProductImage", uploadProductImage); 
router.put("/toggleProductStatus/:id", toggleProductStatus);
router.get("/getMyProducts", getMyProducts); 

module.exports = router;
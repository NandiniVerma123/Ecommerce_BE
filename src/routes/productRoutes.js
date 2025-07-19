const express = require("express");
const router = express.Router();
const {
  addProductByTheUser,
  deleteProductByTheUser,
  updateProductByTheUser,
  getAllProducts,
} = require("../controllers/productController");

const { authenticateUser } = require("../middlewares/authenticate");

// Public route to get all products
router.get("/", getAllProducts);

// Protected routes (require authentication)
router.post("/:role/add", addProductByTheUser);
router.delete("/:role/delete/:id", deleteProductByTheUser);
router.put("/:role/update/:id", updateProductByTheUser);

module.exports = router;

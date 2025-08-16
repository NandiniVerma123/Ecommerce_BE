const express = require("express");
const authenticate = require("../middlewares/authMiddleware");
const {  customerAuth } = require("../middlewares/roleBasedAuth");
const { createOrder } = require("../controllers/orderController");

const router = express.Router();

router.use(authenticate); // ✅ First authenticate and set req.user
router.use(customerAuth);  // ✅ Then check if user has customer role

// Customer routes
router.post("/create_order", createOrder);



module.exports = router;

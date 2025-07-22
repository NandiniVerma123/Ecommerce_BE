const express = require('express');
const authenticate = require('../middlewares/authMiddleware');
const { adminAuth } = require('../middlewares/roleBasedAuth');
const {
  getUser,
  getAllUsers,
  deleteUser,
  updateUserDetails,
  addNewUser,
  getMyProfile,
  changePassword,
  toggleUserStatus
} = require('../controllers/userController');

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  addSubcategory,
  removeSubcategory
} = require('../controllers/categoryController');

const {
  createCoupon,
  editCoupon,
  getCouponUsage,
  upsertCoupon
}
  = require('../controllers/couponController');


const {
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  markOrderDelivered,
} = require('../controllers/orderController');

const {
  updateRefundStatus
} = require('../controllers/returnController');



const router = express.Router();

router.use(authenticate);  // ✅ First authenticate and set req.user
router.use(adminAuth);     // ✅ Then check if user has admin role


// ---------------- User Management Routes ----------------
router.post("/getUser", getUser); // body-based filtering
router.get("/allUsers", getAllUsers); // ?page=1&limit=10&search=&role=vendor
router.post("/addUser", addNewUser);
router.delete("/deleteUser/:id", deleteUser);
router.put("/updateUser/:id", updateUserDetails);
router.put("/toggleUserStatus/:userId", toggleUserStatus);
router.get("/myProfile", getMyProfile); // ?userId=...
router.put("/changePassword/:userId", changePassword);


// ---------------- Category Routes ----------------
router.get("/getAllcategories", getAllCategories);
router.post("/create_categories", createCategory);
router.get("/getcategory/:id", getCategoryById);
router.put("/update_categories/:id", updateCategory);
router.delete("/delete_categories/:id", deleteCategory);
router.post("/addsubcategory/:id", addSubcategory);
router.delete("/removesubcategory/:id/:subId", removeSubcategory);


//------------------- Coupon Management Routes ----------------
router.post("/createCoupon", createCoupon);
router.put("/editCoupon/:id", editCoupon);
router.get("/getCouponUsage", getCouponUsage);
router.post("/upsertCoupon", upsertCoupon); // Create or update a coupon


// ---------------- Order Management Routes ----------------
router.get("/getAllOrders", getAllOrders); // ?page=1&limit=
router.get("/getOrdersByUser", getOrdersByUser); // ?userId=...
router.get("/getOrderById/:id", getOrderById);
router.put("/updateOrderStatus/:id", updateOrderStatus); // ?role=admin
router.delete("/deleteOrder/:id", deleteOrder); // ?role=admin
router.put("/markOrderDelivered/:id", markOrderDelivered); // ?role=admin or vendor


// ---------------- Refund Management Routes ----------------
router.put("/updateRefundStatus/:orderId", updateRefundStatus); // ?role=admin


module.exports = router;


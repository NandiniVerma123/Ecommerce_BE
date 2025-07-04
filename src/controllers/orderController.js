const Order = require("../models/order");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { products, total, address, status = "pending" } = req.body;
    const order = new Order({
      user: userId,
      products,
      total,
      address,
      status,
    });
    await order.save();
    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const orders = await Order.find().populate("user").populate("products.product");
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders for the logged-in user
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    const orders = await Order.find({ user: userId }).populate("products.product");
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get a single order by id (admin or owner)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user").populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (req.user.role !== "admin" && order.user._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete an order (admin only)
const deleteOrder = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }
    const { id } = req.params;
    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add tracking info to an order (admin or vendor)
const addTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const { trackingInfo } = req.body;
    if (req.user.role !== "admin" && req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const order = await Order.findByIdAndUpdate(id, { trackingInfo }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Tracking info updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tracking info for an order (owner or admin/vendor)
const getTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (
      req.user.role !== "admin" &&
      req.user.role !== "vendor" &&
      order.user.toString() !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }
    res.status(200).json({ trackingInfo: order.trackingInfo || null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Leave a review for an order (customer)
const leaveReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { review, rating } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    if (!order.reviews) order.reviews = [];
    order.reviews.push({
      user: req.user.userId,
      review,
      rating,
      date: new Date(),
    });
    await order.save();
    res.status(200).json({ message: "Review added", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Raise a return request (customer)
const raiseReturnRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" });
    }
    order.returnRequest = {
      requested: true,
      reason,
      date: new Date(),
      status: "pending"
    };
    await order.save();
    res.status(200).json({ message: "Return request submitted", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark order as delivered (admin or vendor)
const markOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const order = await Order.findByIdAndUpdate(id, { status: "delivered" }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order marked as delivered", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 1. Sync order to vendor via EventBus/WebSocket (stub for event emit)
const syncOrderToVendor = async (req, res) => {
  try {
    const { id } = req.params;
    // Here you would emit an event to your EventBus or WebSocket server
    // Example: eventBus.emit('orderAssignedToVendor', { orderId: id });
    // For now, just return a stub response
    res.status(200).json({ message: "Order sync event sent to vendor", orderId: id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Monitor inventory movements (stub)
const monitorInventoryMovements = async (req, res) => {
  try {
    // You would typically aggregate inventory logs here
    // For now, just return a stub response
    res.status(200).json({ message: "Inventory movements monitored (stub)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Track shipping compliance (stub)
const trackShippingCompliance = async (req, res) => {
  try {
    // You would check shipping SLAs, delays, etc.
    res.status(200).json({ message: "Shipping compliance tracked (stub)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 4. Verify tracking info validity (stub)
const verifyTrackingInfo = async (req, res) => {
  try {
    const { id } = req.params;
    // You would call the shipping provider API to verify tracking info
    res.status(200).json({ message: "Tracking info verified (stub)", orderId: id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Process commission and payout (stub)
const processCommissionAndPayout = async (req, res) => {
  try {
    const { orderId, vendorId } = req.body;
    // You would calculate commission and trigger payout here
    res.status(200).json({ message: "Commission and payout processed (stub)", orderId, vendorId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 7. Review disputes and final approvals (stub)
const reviewDisputeAndApprove = async (req, res) => {
  try {
    const { disputeId, action } = req.body; // action: 'approve' or 'reject'
    // You would update dispute status here
    res.status(200).json({ message: `Dispute ${action}d (stub)`, disputeId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 1. Vendor receives order notification (stub)
const receiveOrderNotification = async (req, res) => {
  try {
    // In a real app, this would be handled by WebSocket/event system.
    res.status(200).json({ message: "Order notification received (stub)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 2. Prepare shipment and adjust inventory (stub)
const prepareShipmentAndAdjustInventory = async (req, res) => {
  try {
    // You would update inventory and mark order as ready to ship
    res.status(200).json({ message: "Shipment prepared and inventory adjusted (stub)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 3. Mark as shipped on the dashboard
const markOrderShipped = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }
    const order = await Order.findByIdAndUpdate(id, { status: "shipped" }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order marked as shipped", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 6. Monitor earning dashboard (stub)
const getVendorEarnings = async (req, res) => {
  try {
    // You would aggregate orders and commissions for the vendor here
    res.status(200).json({ message: "Vendor earnings dashboard (stub)" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  addTrackingInfo,
  getTrackingInfo,
  leaveReview,
  raiseReturnRequest,
  markOrderDelivered,
  syncOrderToVendor,
  monitorInventoryMovements,
  trackShippingCompliance,
  verifyTrackingInfo,
  processCommissionAndPayout,
  reviewDisputeAndApprove,
  receiveOrderNotification,
  prepareShipmentAndAdjustInventory,
  markOrderShipped,
  getVendorEarnings,
};

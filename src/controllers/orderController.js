const Order = require("../models/order");

// Create a new order
const createOrder = async (req, res) => {
  try {
    const { userId, products, total, address, status = "pending" } = req.body;

    if (!userId) return res.status(400).json({ message: "User ID is required" });

    const order = new Order({ user: userId, products, total, address, status });
    await order.save();

    res.status(201).json({ message: "Order created", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const { role } = req.query;
    if (role !== "admin") return res.status(403).json({ message: "Access denied" });

    const orders = await Order.find().populate("user").populate("products.product");
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get orders by user
const getOrdersByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ user: userId }).populate("products.product");
    res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.query;

    const order = await Order.findById(id).populate("user").populate("products.product");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (role !== "admin" && order.user.toString() !== userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { role } = req.query;
    const { id } = req.params;
    const { status } = req.body;

    if (role !== "admin") return res.status(403).json({ message: "Access denied" });

    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete order
const deleteOrder = async (req, res) => {
  try {
    const { role } = req.query;
    const { id } = req.params;

    if (role !== "admin") return res.status(403).json({ message: "Access denied" });

    const deleted = await Order.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark order delivered
const markOrderDelivered = async (req, res) => {
  try {
    const { role } = req.query;
    const { id } = req.params;

    if (role !== "admin" && role !== "vendor") {
      return res.status(403).json({ message: "Access denied" });
    }

    const order = await Order.findByIdAndUpdate(id, { status: "delivered" }, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });

    res.status(200).json({ message: "Order marked as delivered", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Export controllers
module.exports = {
  createOrder,
  getAllOrders,
  getOrdersByUser,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  markOrderDelivered,
};

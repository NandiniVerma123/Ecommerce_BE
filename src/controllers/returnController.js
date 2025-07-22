// controllers/orderController.js

const Order = require("../models/order");

// Admin approves or rejects a refund
const updateRefundStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body; // "approved" or "rejected"

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: "Invalid refund status" });
        }

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.refundStatus !== "pending") {
            return res.status(400).json({ message: "Refund is not pending" });
        }

        // Update refund status and optionally update paymentStatus
        order.refundStatus = status;
        if (status === 'approved') {
            order.paymentStatus = 'refunded';
            order.status = 'refunded';
        }

        await order.save();

        res.status(200).json({ message: `Refund ${status} successfully`, order });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

module.exports = {
    updateRefundStatus
}

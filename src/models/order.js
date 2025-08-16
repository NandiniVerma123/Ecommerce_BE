const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    products: [
        {
            productName: {
                type: String,
                required: true
            },
            quantity: {
                type: Number,
                default: 1,
                min: 1
            },
            price: {
                type: Number,
                required: true, min: 0
            }
        }
    ],
    status: {
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"], // notice capital P if you want
        default: "pending"
    },
    totalAmount: {
        type: Number,
        required: true,
        min: 0
    },
    shippingAddress: {
        addressLine1: {
            type: String, required: true
        },
        addressLine2: {
            type: String
        },
        city: {
            type: String, required: true
        },
        state: {
            type: String, required: true
        },
        zipCode: {
            type: String, required: true
        }
    },
    paymentMethod: {
        type: String,
        enum: ['none', 'pending', 'approved', 'rejected'],
        required: true
    },


}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

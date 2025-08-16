const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    productImage: {
        type: [String], // store multiple image URLs if needed
        required: true
    },
    pricing: {
        type: Number,
        required: true,
        min: 0
    },
    originalPricing: {
        type: Number,
        min: 0
    },
    inventory: {
        type: Number,
        required: true,
        min: 0
    },
    stockQuantity: {
        type: Number,
        required: true,
        min: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'out of stock'],
        default: 'active'
    },
    // Optional fields
    sku: {
        type: String,
        unique: true,
        trim: true
    },
    brand: {
        type: String
    },
    tags: {
        type: [String]
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

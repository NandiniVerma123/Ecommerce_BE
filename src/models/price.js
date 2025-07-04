const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    oldPrice: {
        type: Number,
        required: true,
        min: 0
    },
    newPrice: {
        type: Number,
        required: true,
        min: 0
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Price', priceSchema);

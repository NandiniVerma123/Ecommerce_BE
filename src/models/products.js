const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    orderId: {
        type: String,
    },
    email: {
        type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
    },
    productName: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    status: {
        type: String,
        enum: [
            'delivered paid',
            'shipped paid',
            'cancelled refunded',
        ],
    },
    total: {
        type: Number,
        min: 0
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
     type: String,
     required: true,
      unique: true 
    },
    discountType: {
         type: String,
         enum: ['flat', 'percentage'],
         required: true
    },
    discountValue: {
         type: Number,
         required: true
    },
    minOrderAmount: {
         type: Number,
         default: 0
    },
    validFrom: {
         type: Date,
         default: Date.now
    },
    expiresAt: {
         type: Date,
         required: true
    },
    usageLimit: {
         type: Number,
         default: 1
    },
    maxDiscount: {
         type: Number,
         default: null
    },
    createdBy: {
         type: mongoose.Schema.Types.ObjectId,    
           ref: 'User',
           required: true
    },
    createdRole : {
           type: String,
           enum: ['admin', 'vendor'],
           required: true
    },
    usedBy: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
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
    expiresAt: {
         type: Date,
         required: true
    },
    usageLimit: {
         type: Number,
         default: 1
    },
    usedBy: [{
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User'
    }]
}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
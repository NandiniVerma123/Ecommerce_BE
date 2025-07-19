const loyaltyPointSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    },
    points: {
        type: Number, default: 0
    },
    transactions: [
        {
            type: {
                type: String,
                enum: ['earned', 'redeemed'],
                required: true
            },
            amount: {
                type: Number,
                required: true
            },
            date: {
                type: Date,
                default: Date.now
            },
            reason: { type: String }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('LoyaltyPoint', loyaltyPointSchema);
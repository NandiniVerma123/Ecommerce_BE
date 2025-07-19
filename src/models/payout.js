const payoutSchema = new mongoose.Schema({
    vendor: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Vendor', 
        required: true 
    },
    amount: { 
        type: Number, 
        required: true 
    },
    status: { 
        type: String,
        enum: ['pending', 'processing', 'paid', 'failed'], 
        default: 'pending' 
    },
    processedAt: { 
        type: Date 
    }
}, { timestamps: true });

module.exports = mongoose.model('Payout', payoutSchema);
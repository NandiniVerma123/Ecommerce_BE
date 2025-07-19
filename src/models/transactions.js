const transactionSchema = new mongoose.Schema({
    order: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true 
    },
    user: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true 
    },
    amount: { 
        type: Number, required: true 
    },
    paymentMethod: { 
        type: String, enum: ['card', 'upi', 'netbanking', 'cod'], required: true 
    },
    status: { 
        type: String, enum: ['pending', 'success', 'failed'], default: 'pending' 
    },
    transactionId: { 
        type: String 
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["customer", "admin", "vendor"],
    default: "customer"
  },
  city: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["activate", "deactivate"],
    default: "activate"
  },

  // ✅ Vendor-specific (optional) fields:
  storeName: {
    type: String,
    default: null
  },
  gstNumber: {
    type: String,
    default: null
  },

  // Wishlist (customer feature)
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product"
    }
  ]
}, {
  timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;

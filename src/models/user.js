const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 100,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  role: {
    type: String,
    enum: ["customer", "admin", "vendor"],
    default: "customer",
  },

  phone: {
    type: String,
  },

  addresses: [addressSchema], // Optional: Add support for multiple addresses

  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;

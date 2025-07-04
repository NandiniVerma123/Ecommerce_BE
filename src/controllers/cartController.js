const Cart = require("../models/cart");
const Product = require("../models/product");

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity = 1 } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }
    await cart.save();
    res.status(200).json({ message: "Added to cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    res.status(200).json({ message: "Removed from cart", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    const item = cart.items.find(item => item.product.toString() === productId);
    if (!item) return res.status(404).json({ message: "Product not in cart" });

    item.quantity = quantity;
    await cart.save();
    res.status(200).json({ message: "Cart item updated", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    cart.items = [];
    await cart.save();
    res.status(200).json({ message: "Cart cleared", cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItem,
  getCart,
  clearCart,
};

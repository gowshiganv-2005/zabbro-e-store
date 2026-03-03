/**
 * MongoDB Models
 * Defines all schemas matching the existing Excel data structure
 */

const mongoose = require('mongoose');

// ═══════════════════════════════════════
// PRODUCT SCHEMA
// ═══════════════════════════════════════
const productSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, default: 0 },
    category: { type: String, default: '' },
    subcategory: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    images: { type: String, default: '' },
    stock: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    featured: { type: mongoose.Schema.Types.Mixed, default: false },
    bestSeller: { type: mongoose.Schema.Types.Mixed, default: false },
    newArrival: { type: mongoose.Schema.Types.Mixed, default: false },
    brand: { type: String, default: '' },
    material: { type: String, default: '' },
    color: { type: String, default: '' },
    tags: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false, timestamps: false });

// ═══════════════════════════════════════
// USER SCHEMA
// ═══════════════════════════════════════
const userSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, default: 'customer' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    lastLogin: { type: String, default: () => new Date().toISOString() }
}, { strict: false, timestamps: false });

// ═══════════════════════════════════════
// ORDER SCHEMA
// ═══════════════════════════════════════
const orderSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    userName: { type: String, default: '' },
    userEmail: { type: String, default: '' },
    products: { type: String, default: '[]' },
    subtotal: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: { type: String, default: 'pending' },
    shippingAddress: { type: String, default: '' },
    paymentMethod: { type: String, default: 'Credit Card' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    updatedAt: { type: String, default: () => new Date().toISOString() }
}, { strict: false, timestamps: false });

// ═══════════════════════════════════════
// INVENTORY SCHEMA
// ═══════════════════════════════════════
const inventorySchema = new mongoose.Schema({
    productId: { type: String, required: true, unique: true },
    productName: { type: String, default: '' },
    currentStock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },
    availableStock: { type: Number, default: 0 },
    reorderLevel: { type: Number, default: 10 },
    reorderQuantity: { type: Number, default: 50 },
    lastRestocked: { type: String, default: '' },
    supplier: { type: String, default: '' },
    status: { type: String, default: 'in_stock' }
}, { strict: false, timestamps: false });

// ═══════════════════════════════════════
// REVIEW SCHEMA
// ═══════════════════════════════════════
const reviewSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, default: '' },
    rating: { type: Number, required: true },
    title: { type: String, default: '' },
    comment: { type: String, default: '' },
    createdAt: { type: String, default: () => new Date().toISOString() },
    helpful: { type: Number, default: 0 }
}, { strict: false, timestamps: false });

// Create models
const Product = mongoose.model('Product', productSchema);
const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = { Product, User, Order, Inventory, Review };

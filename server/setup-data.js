/**
 * Google Sheets Data Seeding Script
 * Populates your Google Spreadsheet with initial sample data.
 * Run with: npm run setup
 */

require('dotenv').config();
const { writeExcel } = require('./utils/excel');
const bcrypt = require('bcryptjs');

const products = [
    {
        id: 'prod_001',
        name: 'Minimalist Ceramic Vase',
        price: 89.00,
        originalPrice: 120.00,
        category: 'Home Decor',
        subcategory: 'Vases',
        description: 'Handcrafted ceramic vase with a clean, modern silhouette. Perfect for minimalist interiors. Each piece is unique with subtle variations in glaze.',
        image: '/uploads/products/vase.jpg',
        images: '/uploads/products/vase.jpg,/uploads/products/vase-2.jpg',
        stock: 45,
        rating: 4.8,
        reviewCount: 124,
        featured: true,
        bestSeller: true,
        newArrival: false,
        brand: 'Artisan Co.',
        material: 'Ceramic',
        color: 'White',
        tags: 'minimalist,vase,ceramic,home decor'
    },
    {
        id: 'prod_002',
        name: 'Premium Leather Tote Bag',
        price: 249.00,
        originalPrice: 299.00,
        category: 'Accessories',
        subcategory: 'Bags',
        description: 'Full-grain Italian leather tote with a spacious interior. Features brass hardware and a removable shoulder strap. Ages beautifully over time.',
        image: '/uploads/products/bag.jpg',
        images: '/uploads/products/bag.jpg,/uploads/products/bag-2.jpg',
        stock: 30,
        rating: 4.9,
        reviewCount: 89,
        featured: true,
        bestSeller: true,
        newArrival: false,
        brand: 'Luxe Leather',
        material: 'Italian Leather',
        color: 'Tan',
        tags: 'leather,bag,tote,premium,accessories'
    },
    {
        id: 'prod_003',
        name: 'Wireless Noise-Cancelling Headphones',
        price: 349.00,
        originalPrice: 399.00,
        category: 'Electronics',
        subcategory: 'Audio',
        description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound. Ultra-comfortable memory foam ear cushions.',
        image: '/uploads/products/headphones.jpg',
        images: '/uploads/products/headphones.jpg,/uploads/products/headphones-2.jpg',
        stock: 85,
        rating: 4.7,
        reviewCount: 312,
        featured: true,
        bestSeller: false,
        newArrival: true,
        brand: 'SoundElite',
        material: 'Aluminum & Leather',
        color: 'Midnight Black',
        tags: 'headphones,wireless,noise-cancelling,electronics'
    }
];

const users = [
    {
        id: 'user_001',
        name: 'Admin User',
        email: 'admin@store.com',
        password: bcrypt.hashSync('admin123', 10),
        role: 'admin',
        phone: '+1-555-0100',
        address: '123 Admin Street, New York, NY 10001',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    }
];

const inventory = products.map(p => ({
    productId: p.id,
    productName: p.name,
    currentStock: p.stock,
    reservedStock: 0,
    availableStock: p.stock,
    reorderLevel: 10,
    reorderQuantity: 50,
    lastRestocked: new Date().toISOString(),
    supplier: p.brand,
    status: 'in_stock'
}));

async function seed() {
    console.log('🚀 Seeding Google Sheets...');

    if (!process.env.GOOGLE_SPREADSHEET_ID) {
        console.error('❌ GOOGLE_SPREADSHEET_ID missing in .env');
        return;
    }

    try {
        await writeExcel('products.xlsx', products);
        console.log('✅ Products seeded');

        await writeExcel('users.xlsx', users);
        console.log('✅ Users seeded');

        await writeExcel('inventory.xlsx', inventory);
        console.log('✅ Inventory seeded');

        // Create empty sheets for orders and reviews
        await writeExcel('orders.xlsx', [{ id: 'order_template', userId: '', products: '[]', total: 0, status: 'pending', createdAt: '' }]);
        await writeExcel('reviews.xlsx', [{ id: 'review_template', productId: '', userId: '', rating: 5, comment: '', createdAt: '' }]);

        console.log('\n🎉 All sheets seeded successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
    }
}

seed();

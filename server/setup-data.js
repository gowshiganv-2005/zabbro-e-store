/**
 * Google Sheets Data Seeding Script
 * Populates your Google Spreadsheet with initial sample data.
 * Run with: npm run setup
 */

require('dotenv').config();
const { writeExcel, readExcel } = require('./utils/excel');
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
    },
    {
        id: 'prod_004',
        name: 'Organic Cotton Throw Blanket',
        price: 129.00,
        originalPrice: 159.00,
        category: 'Home Decor',
        subcategory: 'Textiles',
        description: 'Sustainably made from 100% organic cotton. Soft, breathable, and perfect for layering on sofas or beds. Machine washable and hypoallergenic.',
        image: '/uploads/products/blanket.jpg',
        images: '/uploads/products/blanket.jpg,/uploads/products/blanket-2.jpg',
        stock: 60,
        rating: 4.6,
        reviewCount: 156,
        featured: false,
        bestSeller: true,
        newArrival: false,
        brand: 'EcoLiving',
        material: 'Organic Cotton',
        color: 'Ivory',
        tags: 'blanket,organic,cotton,textile,cozy'
    },
    {
        id: 'prod_005',
        name: 'Modern Desk Lamp',
        price: 179.00,
        originalPrice: 219.00,
        category: 'Lighting',
        subcategory: 'Desk Lamps',
        description: 'Sleek LED desk lamp with adjustable color temperature and brightness. Touch-sensitive controls, USB charging port, and a minimal design that complements any workspace.',
        image: '/uploads/products/lamp.jpg',
        images: '/uploads/products/lamp.jpg,/uploads/products/lamp-2.jpg',
        stock: 40,
        rating: 4.5,
        reviewCount: 78,
        featured: true,
        bestSeller: false,
        newArrival: true,
        brand: 'LumiDesign',
        material: 'Aluminum',
        color: 'Silver',
        tags: 'lamp,desk,LED,lighting,modern'
    },
    {
        id: 'prod_006',
        name: 'Heritage Watch Collection',
        price: 599.00,
        originalPrice: 750.00,
        category: 'Accessories',
        subcategory: 'Watches',
        description: 'Classic automatic timepiece with sapphire crystal, exhibition case back, and genuine leather strap. Swiss-made movement with 42-hour power reserve.',
        image: '/uploads/products/watch.jpg',
        images: '/uploads/products/watch.jpg,/uploads/products/watch-2.jpg',
        stock: 15,
        rating: 4.9,
        reviewCount: 45,
        featured: true,
        bestSeller: false,
        newArrival: false,
        brand: 'Meridian',
        material: 'Stainless Steel',
        color: 'Rose Gold',
        tags: 'watch,automatic,heritage,luxury,accessories'
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

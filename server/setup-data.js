/**
 * Google Sheets Data Seeding Script
 * Populates your Google Spreadsheet with initial sample data and the Admin User.
 * Run with: npm run setup
 */

require('dotenv').config();
const { writeExcel } = require('./utils/excel');
const bcrypt = require('bcryptjs');

const products = [
    // PROJECTS
    {
        id: 'prod_proj_1',
        name: 'AI Home Automation Hub',
        price: 15499.00,
        originalPrice: 18000.00,
        category: 'Projects',
        subcategory: 'Smart Home',
        description: 'A complete open-source AI hub for controlling your home devices with voice and gesture recognition.',
        image: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f',
        images: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f,https://images.unsplash.com/photo-1518770660439-4636190af475',
        stock: 25,
        rating: 4.9,
        reviewCount: 45,
        featured: true,
        bestSeller: true,
        newArrival: false,
        brand: 'ZABBRO',
        material: 'Aluminum',
        color: 'Space Grey',
        tags: 'projects,ai,smarthome'
    },
    // T-SHIRTS
    {
        id: 'prod_tsh_1',
        name: 'Zabbro Oversized Tech Tee',
        price: 1299.00,
        originalPrice: 1599.00,
        category: 'T-shirts',
        subcategory: 'Streetwear',
        description: 'Heavyweight 240 GSM cotton oversized t-shirt with reflective ZABBRO print.',
        image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a',
        images: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a,https://images.unsplash.com/photo-1521572267360-ee0c2909d518',
        stock: 120,
        rating: 4.8,
        reviewCount: 320,
        featured: true,
        bestSeller: true,
        newArrival: true,
        brand: 'ZABBRO',
        material: '100% Organic Cotton',
        color: 'Black',
        tags: 'fashion,tshirt,streetwear'
    },
    // WEBSITES
    {
        id: 'prod_web_1',
        name: 'E-Commerce React Template',
        price: 4500.00,
        originalPrice: 6000.00,
        category: 'Websites',
        subcategory: 'E-commerce',
        description: 'Fully responsive, high-performance React template for modern online stores.',
        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
        images: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f,https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        stock: 999,
        rating: 5.0,
        reviewCount: 67,
        featured: true,
        bestSeller: false,
        newArrival: true,
        brand: 'ZABBRO DIGITAL',
        material: 'Digital Asset',
        color: 'Multicolor',
        tags: 'web,react,ecommerce'
    },
    // WOODEN PRODUCTS
    {
        id: 'prod_wood_1',
        name: 'Handcrafted Oak Monitor Stand',
        price: 3200.00,
        originalPrice: 4500.00,
        category: 'Wooden Products',
        subcategory: 'Office Decor',
        description: 'Sustainable solid oak monitor riser with built-in cable management.',
        image: 'https://images.unsplash.com/photo-1593642532400-2682810df593',
        images: 'https://images.unsplash.com/photo-1593642532400-2682810df593,https://images.unsplash.com/photo-1517336714731-489689fd1ca8',
        stock: 15,
        rating: 4.7,
        reviewCount: 28,
        featured: false,
        bestSeller: true,
        newArrival: false,
        brand: 'ZABBRO WOODS',
        material: 'Solid Oak',
        color: 'Natural Wood',
        tags: 'wooden,decor,office'
    },
    // TRENDY PRODUCTS
    {
        id: 'prod_trend_1',
        name: 'Transparent Mechanical Keyboard',
        price: 6499.00,
        originalPrice: 7999.00,
        category: 'Trendy Products',
        subcategory: 'Gaming',
        description: 'Gasket-mounted transparent 75% mechanical keyboard with RGB aura.',
        image: 'https://images.unsplash.com/photo-1618384881928-142835f8d975',
        images: 'https://images.unsplash.com/photo-1618384881928-142835f8d975,https://images.unsplash.com/photo-1511467687858-23d96c32e4ae',
        stock: 40,
        rating: 4.9,
        reviewCount: 156,
        featured: true,
        bestSeller: true,
        newArrival: true,
        brand: 'ZABBRO TECH',
        material: 'Polycarbonate',
        color: 'Transparent',
        tags: 'trendy,gaming,keyboard'
    },
    // PLANTS
    {
        id: 'prod_plant_1',
        name: 'Large Monstera Deliciosa',
        price: 2499.00,
        originalPrice: 2999.00,
        category: 'Plants',
        subcategory: 'Indoor',
        description: 'Healthy, established Monstera in a premium ceramic pot.',
        image: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b',
        images: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b,https://images.unsplash.com/photo-1545239351-ef35f43d514b',
        stock: 20,
        rating: 4.6,
        reviewCount: 52,
        featured: false,
        bestSeller: false,
        newArrival: true,
        brand: 'ZABBRO GREEN',
        material: 'Ceramic Pot',
        color: 'Green & White',
        tags: 'plants,decor,indoor'
    },
    // STICKERS
    {
        id: 'prod_stick_1',
        name: 'Holographic Dev Sticker Pack',
        price: 499.00,
        originalPrice: 699.00,
        category: 'Stickers',
        subcategory: 'Stationery',
        description: 'Set of 10 waterproof holographic stickers for laptops and journals.',
        image: 'https://images.unsplash.com/photo-1572375995301-45564676ecdb',
        images: 'https://images.unsplash.com/photo-1572375995301-45564676ecdb,https://images.unsplash.com/photo-1589118949245-7d38baf380d6',
        stock: 500,
        rating: 4.9,
        reviewCount: 412,
        featured: true,
        bestSeller: true,
        newArrival: false,
        brand: 'ZABBRO ART',
        material: 'Vinyl',
        color: 'Holographic',
        tags: 'stickers,dev,stationery'
    },
    // TECH ACCESSORIES
    {
        id: 'prod_tech_1',
        name: 'Zabbro Bolt Power Bank',
        price: 3499.00,
        originalPrice: 4200.00,
        category: 'Tech Accessories',
        subcategory: 'Charging',
        description: '20,000mAh fast-charging power bank with digital percentage display.',
        image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586',
        images: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586,https://images.unsplash.com/photo-1550745165-9bc0b252726f',
        stock: 65,
        rating: 4.8,
        reviewCount: 215,
        featured: true,
        bestSeller: false,
        newArrival: true,
        brand: 'ZABBRO',
        material: 'Durable Plastic',
        color: 'Midnight Blue',
        tags: 'tech,charging,portable'
    },
    // CUSTOMIZED PRODUCTS
    {
        id: 'prod_cust_1',
        name: 'Custom 3D Printed Keycap',
        price: 899.00,
        originalPrice: 1200.00,
        category: 'Customized Products',
        subcategory: 'Gaming',
        description: 'Unique 3D printed Artisan keycap customized with your initials.',
        image: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc',
        images: 'https://images.unsplash.com/photo-1595246140625-573b715d11dc,https://images.unsplash.com/photo-1512756290469-ec264b7fbf87',
        stock: 100,
        rating: 4.9,
        reviewCount: 34,
        featured: false,
        bestSeller: false,
        newArrival: true,
        brand: 'ZABBRO LABS',
        material: 'Resin',
        color: 'Custom',
        tags: 'custom,gaming,artisan'
    }
];

const users = [
    {
        id: 'user_admin',
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
    console.log('🚀 Seeding Google Sheets Database...');

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SPREADSHEET_ID || !process.env.GOOGLE_PRIVATE_KEY) {
        console.error('❌ Missing credentials in .env file (check GOOGLE_PRIVATE_KEY)');
        return;
    }

    try {
        await writeExcel('products.xlsx', products);
        console.log('✅ Products seeded successfully');

        await writeExcel('users.xlsx', users);
        console.log('✅ Admin user created: admin@store.com / admin123');

        await writeExcel('inventory.xlsx', inventory);
        console.log('✅ Inventory records created');

        // Ensure empty sheets for orders and reviews exist with headers
        await writeExcel('orders.xlsx', [{ id: 'order_template', userId: '', userName: '', userEmail: '', userPhone: '', products: '[]', total: 0, status: 'pending', createdAt: '' }]);
        await writeExcel('reviews.xlsx', [{ id: 'review_template', productId: '', userId: '', rating: 5, comment: '', createdAt: '' }]);

        console.log('\n🎉 SUCCESS! Your Google Spreadsheet is now persistent and loaded with data.');
        console.log('You can now log in at your website with: admin@store.com / admin123');
    } catch (error) {
        console.error('❌ Seeding failed (Check if service account has "Editor" permission):', error.message);
    }
}

seed();

/**
 * E-Commerce Store - Main Server
 * Express.js server with Google Sheets cloud database
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════
// MIDDLEWARE
// ═══════════════════════════════════════
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Ensure upload directories exist
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// Request logging
app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
        console.log(`${new Date().toISOString().slice(11, 19)} ${req.method} ${req.url}`);
    }
    next();
});

// ═══════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════
app.use('/api/products', require('./routes/products'));
app.use('/api/users', require('./routes/users'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/admin', require('./routes/admin'));

// ═══════════════════════════════════════
// SPA FALLBACK - Serve index.html for all non-API routes
// ═══════════════════════════════════════
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
});

// ═══════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ success: false, message: 'Internal server error', error: err.message });
});

// ═══════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║                                              ║
║   🛒  E-Commerce Store Server                ║
║                                              ║
║   → Local:   http://localhost:${PORT}           ║
║   → API:     http://localhost:${PORT}/api       ║
║                                              ║
║   📊  Database: Google Sheets (Cloud)         ║
║                                              ║
╚══════════════════════════════════════════════╝
    `);
});

module.exports = app;

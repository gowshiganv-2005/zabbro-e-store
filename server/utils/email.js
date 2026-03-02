/**
 * Email Utility Module
 * Sends order confirmation emails to customers and admin
 * Uses Nodemailer with Gmail SMTP
 */

const nodemailer = require('nodemailer');

// ═══════════════════════════════════════
// CONFIGURATION — Update these values
// ═══════════════════════════════════════
const EMAIL_CONFIG = {
    // Gmail address to send emails FROM
    senderEmail: process.env.SMTP_EMAIL || '',
    // Gmail App Password (NOT your regular password)
    // Generate at: https://myaccount.google.com/apppasswords
    senderPassword: process.env.SMTP_PASSWORD || '',
    // Admin email to receive order notifications
    adminEmail: process.env.ADMIN_EMAIL || '',
    // Store name
    storeName: 'ZABBRO',
    storeUrl: process.env.STORE_URL || 'http://localhost:3000'
};

// Create transporter (only if credentials are set)
let transporter = null;

function getTransporter() {
    if (transporter) return transporter;
    if (!EMAIL_CONFIG.senderEmail || !EMAIL_CONFIG.senderPassword) {
        console.warn('⚠️  Email not configured. Set SMTP_EMAIL and SMTP_PASSWORD environment variables.');
        return null;
    }
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_CONFIG.senderEmail,
            pass: EMAIL_CONFIG.senderPassword
        }
    });
    return transporter;
}

// ═══════════════════════════════════════
// FORMAT HELPERS
// ═══════════════════════════════════════
function formatINR(amount) {
    return '₹' + parseFloat(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function getPaymentLabel(method) {
    const labels = {
        credit_card: 'Credit / Debit Card',
        upi: 'UPI',
        cod: 'Cash on Delivery',
        paypal: 'PayPal'
    };
    return labels[method] || method;
}

function getEstimatedDelivery() {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ═══════════════════════════════════════
// HTML EMAIL TEMPLATE
// ═══════════════════════════════════════
function buildOrderEmailHTML(order, products, isAdmin = false) {
    const productRows = products.map(p => `
        <tr>
            <td style="padding:14px 16px;border-bottom:1px solid #eee;font-size:14px">
                <strong>${p.name}</strong>
            </td>
            <td style="padding:14px 16px;border-bottom:1px solid #eee;font-size:14px;text-align:center">${p.quantity}</td>
            <td style="padding:14px 16px;border-bottom:1px solid #eee;font-size:14px;text-align:right">${formatINR(p.price)}</td>
            <td style="padding:14px 16px;border-bottom:1px solid #eee;font-size:14px;text-align:right;font-weight:600">${formatINR(p.price * p.quantity)}</td>
        </tr>
    `).join('');

    const statusSteps = [
        { label: 'Order Placed', icon: '✓', active: true },
        { label: 'Processing', icon: '2', active: false },
        { label: 'Shipped', icon: '3', active: false },
        { label: 'Delivered', icon: '4', active: false }
    ];

    const stepsHTML = statusSteps.map(s => `
        <td style="text-align:center;padding:8px">
            <div style="width:32px;height:32px;border-radius:50%;background:${s.active ? '#111' : '#e0e0e0'};color:${s.active ? '#fff' : '#999'};display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;margin-bottom:6px">${s.icon}</div>
            <div style="font-size:11px;color:${s.active ? '#111' : '#999'};font-weight:${s.active ? '600' : '400'}">${s.label}</div>
        </td>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:600px;margin:0 auto;background:#fff">

    <!-- Header -->
    <div style="background:#111;padding:32px 40px;text-align:center">
        <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:4px;font-weight:300">${EMAIL_CONFIG.storeName}</h1>
    </div>

    <!-- Title -->
    <div style="padding:40px 40px 24px;text-align:center">
        <div style="width:56px;height:56px;border-radius:50%;background:#e8f5e9;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px">
            <span style="font-size:28px">✓</span>
        </div>
        <h2 style="margin:0 0 8px;font-size:22px;color:#111">${isAdmin ? 'New Order Received!' : 'Order Confirmed!'}</h2>
        <p style="margin:0;color:#666;font-size:14px">${isAdmin ? `A new order has been placed by ${order.userName}` : 'Thank you for your purchase! Your order has been received.'}</p>
    </div>

    <!-- Order Info -->
    <div style="padding:0 40px 24px">
        <div style="background:#fafafa;border-radius:12px;padding:20px;display:flex;flex-wrap:wrap;gap:0">
            <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                    <td style="padding:8px 12px;font-size:13px;color:#666">Order ID</td>
                    <td style="padding:8px 12px;font-size:13px;font-weight:700;text-align:right">${order.id}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;font-size:13px;color:#666">Date</td>
                    <td style="padding:8px 12px;font-size:13px;text-align:right">${formatDate(order.createdAt)}</td>
                </tr>
                <tr>
                    <td style="padding:8px 12px;font-size:13px;color:#666">Payment</td>
                    <td style="padding:8px 12px;font-size:13px;text-align:right">${getPaymentLabel(order.paymentMethod)}</td>
                </tr>
                ${isAdmin ? `<tr>
                    <td style="padding:8px 12px;font-size:13px;color:#666">Customer</td>
                    <td style="padding:8px 12px;font-size:13px;text-align:right">${order.userName} (${order.userEmail})</td>
                </tr>` : ''}
            </table>
        </div>
    </div>

    <!-- Delivery Progress (customer only) -->
    ${!isAdmin ? `
    <div style="padding:0 40px 24px">
        <h3 style="font-size:15px;color:#111;margin:0 0 16px">Delivery Progress</h3>
        <table width="100%" cellpadding="0" cellspacing="0"><tr>${stepsHTML}</tr></table>
        <div style="margin-top:12px;padding:12px;background:#fff3e0;border-radius:8px;font-size:13px;color:#e65100">
            📦 Estimated delivery: <strong>${getEstimatedDelivery()}</strong>
        </div>
    </div>` : ''}

    <!-- Products Table -->
    <div style="padding:0 40px 24px">
        <h3 style="font-size:15px;color:#111;margin:0 0 12px">Order Items</h3>
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden">
            <thead>
                <tr style="background:#fafafa">
                    <th style="padding:12px 16px;text-align:left;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Product</th>
                    <th style="padding:12px 16px;text-align:center;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Qty</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Price</th>
                    <th style="padding:12px 16px;text-align:right;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:.5px">Total</th>
                </tr>
            </thead>
            <tbody>${productRows}</tbody>
        </table>
    </div>

    <!-- Price Summary -->
    <div style="padding:0 40px 24px">
        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:8px;overflow:hidden">
            <tr><td style="padding:10px 16px;font-size:14px;color:#666">Subtotal</td><td style="padding:10px 16px;font-size:14px;text-align:right">${formatINR(order.subtotal)}</td></tr>
            <tr><td style="padding:10px 16px;font-size:14px;color:#666">Shipping</td><td style="padding:10px 16px;font-size:14px;text-align:right">${order.shipping == 0 ? '<span style="color:#2e7d32;font-weight:600">FREE</span>' : formatINR(order.shipping)}</td></tr>
            <tr><td style="padding:10px 16px;font-size:14px;color:#666">Tax (GST 8%)</td><td style="padding:10px 16px;font-size:14px;text-align:right">${formatINR(order.tax)}</td></tr>
            <tr style="background:#111"><td style="padding:14px 16px;font-size:16px;color:#fff;font-weight:700">Total</td><td style="padding:14px 16px;font-size:16px;text-align:right;color:#fff;font-weight:700">${formatINR(order.total)}</td></tr>
        </table>
    </div>

    <!-- Shipping Address -->
    <div style="padding:0 40px 32px">
        <h3 style="font-size:15px;color:#111;margin:0 0 12px">Shipping Address</h3>
        <div style="background:#fafafa;border-radius:8px;padding:16px;font-size:14px;color:#333;line-height:1.6">
            📍 ${order.shippingAddress || 'Not provided'}
        </div>
    </div>

    ${!isAdmin ? `
    <!-- What's Next -->
    <div style="padding:0 40px 32px">
        <h3 style="font-size:15px;color:#111;margin:0 0 12px">What's Next?</h3>
        <div style="font-size:13px;color:#666;line-height:1.8">
            <div>📋 Your order is being <strong>reviewed</strong> by our team</div>
            <div>📦 You'll receive a <strong>shipping notification</strong> once dispatched</div>
            <div>🚚 Track your delivery status in your <strong>account dashboard</strong></div>
            <div>💬 Questions? Reach out to us at <strong>${EMAIL_CONFIG.senderEmail || 'support@zabbro.com'}</strong></div>
        </div>
    </div>` : ''}

    <!-- Footer -->
    <div style="background:#fafafa;padding:24px 40px;text-align:center;border-top:1px solid #eee">
        <p style="margin:0 0 8px;font-size:18px;letter-spacing:3px;font-weight:300;color:#111">${EMAIL_CONFIG.storeName}</p>
        <p style="margin:0;font-size:12px;color:#999">Premium E-Commerce Store by Zabbro Digital Solutions</p>
        <p style="margin:8px 0 0;font-size:11px;color:#ccc">This is an automated email. Please do not reply directly.</p>
    </div>

</div>
</body>
</html>`;
}

// ═══════════════════════════════════════
// SEND EMAIL FUNCTIONS
// ═══════════════════════════════════════

/**
 * Send order confirmation email to customer
 */
async function sendCustomerOrderEmail(order, products) {
    const t = getTransporter();
    if (!t) return { sent: false, reason: 'Email not configured' };

    try {
        await t.sendMail({
            from: `"${EMAIL_CONFIG.storeName}" <${EMAIL_CONFIG.senderEmail}>`,
            to: order.userEmail,
            subject: `✓ Order Confirmed — ${order.id} | ${EMAIL_CONFIG.storeName}`,
            html: buildOrderEmailHTML(order, products, false)
        });
        console.log(`📧 Customer email sent to ${order.userEmail}`);
        return { sent: true };
    } catch (err) {
        console.error(`❌ Failed to send customer email:`, err.message);
        return { sent: false, reason: err.message };
    }
}

/**
 * Send order notification email to admin
 */
async function sendAdminOrderEmail(order, products) {
    const t = getTransporter();
    if (!t || !EMAIL_CONFIG.adminEmail) return { sent: false, reason: 'Admin email not configured' };

    try {
        await t.sendMail({
            from: `"${EMAIL_CONFIG.storeName} Orders" <${EMAIL_CONFIG.senderEmail}>`,
            to: EMAIL_CONFIG.adminEmail,
            subject: `🛒 New Order ${order.id} — ${formatINR(order.total)} from ${order.userName}`,
            html: buildOrderEmailHTML(order, products, true)
        });
        console.log(`📧 Admin email sent to ${EMAIL_CONFIG.adminEmail}`);
        return { sent: true };
    } catch (err) {
        console.error(`❌ Failed to send admin email:`, err.message);
        return { sent: false, reason: err.message };
    }
}

/**
 * Send both customer and admin order emails
 */
async function sendOrderEmails(order, products) {
    const [customer, admin] = await Promise.allSettled([
        sendCustomerOrderEmail(order, products),
        sendAdminOrderEmail(order, products)
    ]);
    return {
        customer: customer.status === 'fulfilled' ? customer.value : { sent: false },
        admin: admin.status === 'fulfilled' ? admin.value : { sent: false }
    };
}

module.exports = { sendOrderEmails, sendCustomerOrderEmail, sendAdminOrderEmail };

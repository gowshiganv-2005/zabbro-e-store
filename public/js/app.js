/**
 * App.js - Main Router & Init (Updated with About, Account routes)
 */
(function () {
    'use strict';

    function router() {
        const hash = window.location.hash || '#/';
        const [path, queryString] = hash.slice(1).split('?');
        const params = Object.fromEntries(new URLSearchParams(queryString || ''));
        const segments = path.split('/').filter(Boolean);

        document.getElementById('mobile-nav')?.classList.remove('open');
        closeMiniCart();
        // Clean up parallax if navigating away from home
        if (window._heroParallaxCleanup) { window._heroParallaxCleanup(); window._heroParallaxCleanup = null; }
        window.scrollTo(0, 0);

        switch (segments[0] || '') {
            case '': case 'home':
                setActiveNav('home'); renderHomePage(); break;
            case 'products':
                setActiveNav('products'); renderProductsPage(params); break;
            case 'product':
                setActiveNav('products'); renderProductDetailPage(segments[1]); break;
            case 'cart':
                setActiveNav(''); renderCartPage(); break;
            case 'checkout':
                setActiveNav(''); renderCheckoutPage(); break;
            case 'auth':
                setActiveNav(''); renderAuthPage(segments[1] || 'login'); break;
            case 'account':
                setActiveNav(''); renderAccountPage(segments[1] || 'profile'); break;
            case 'about':
                setActiveNav('about'); renderAboutPage(); break;
            case 'order-confirmation':
                setActiveNav(''); renderOrderConfirmationPage(segments[1]); break;
            case 'admin':
                setActiveNav(''); renderAdminPage(segments[1] || 'overview'); break;
            default:
                document.getElementById('app').innerHTML = `
          <div style="text-align:center;padding:120px 20px">
            <h1 style="font-family:var(--font-serif);font-size:3rem;margin-bottom:12px">404</h1>
            <p style="color:var(--text-secondary);margin-bottom:24px">Page not found</p>
            <a href="#/" class="btn btn-primary">Go Home</a>
          </div>`;
        }

        // Update header Create Account btn visibility
        updateSignupBtn();
    }

    function setActiveNav(page) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.toggle('active', link.dataset.page === page);
        });
    }

    function updateSignupBtn() {
        const btn = document.getElementById('signup-header-btn');
        if (btn) {
            btn.style.display = Store.isLoggedIn() ? 'none' : 'inline-flex';
        }
    }

    function initHeader() {
        window.addEventListener('scroll', () => {
            document.getElementById('main-header')?.classList.toggle('scrolled', window.scrollY > 10);
        });
        document.getElementById('search-toggle')?.addEventListener('click', () => {
            const bar = document.getElementById('search-bar');
            bar?.classList.toggle('open');
            if (bar?.classList.contains('open')) setTimeout(() => document.getElementById('search-input')?.focus(), 100);
        });
        document.getElementById('search-close')?.addEventListener('click', () => {
            document.getElementById('search-bar')?.classList.remove('open');
        });
        document.getElementById('search-input')?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                window.location.hash = `#/products?search=${encodeURIComponent(e.target.value.trim())}`;
                document.getElementById('search-bar')?.classList.remove('open');
                e.target.value = '';
            }
        });
        document.getElementById('notification-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            const dropdown = document.getElementById('notification-dropdown');
            dropdown?.classList.toggle('open');
            if (dropdown?.classList.contains('open')) {
                refreshNotifications();
                document.getElementById('notification-badge').style.display = 'none';
            }
        });
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#notification-dropdown') && !e.target.closest('#notification-toggle')) {
                document.getElementById('notification-dropdown')?.classList.remove('open');
            }
        });
        document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
            document.getElementById('mobile-nav')?.classList.toggle('open');
        });
        document.getElementById('cart-toggle')?.addEventListener('click', openMiniCart);
        document.getElementById('mini-cart-close')?.addEventListener('click', closeMiniCart);
        document.getElementById('cart-overlay')?.addEventListener('click', closeMiniCart);
        document.getElementById('view-cart-btn')?.addEventListener('click', closeMiniCart);
        document.getElementById('mini-checkout-btn')?.addEventListener('click', closeMiniCart);
    }

    async function refreshNotifications() {
        const list = document.getElementById('notification-list');
        if (!list) return;

        try {
            const res = await API.products.list({ limit: 5, sort: 'newest' });
            const notifications = [];

            if (res.success && res.data.length > 0) {
                res.data.filter(p => p.newArrival).forEach(p => {
                    notifications.push({
                        icon: 'package',
                        title: 'New Arrival',
                        text: `Check out our new ${p.name}!`,
                        time: 'Just now',
                        link: `#/product/${p.id}`
                    });
                });
            }

            if (Store.isLoggedIn()) {
                const orders = await API.orders.list();
                if (orders.success && orders.data.length > 0) {
                    const latest = orders.data[0];
                    notifications.push({
                        icon: 'clock',
                        title: 'Order Status',
                        text: `Your order ${latest.id} is currently ${latest.status}.`,
                        time: 'Update',
                        link: `#/account/orders`
                    });
                }
            }

            if (notifications.length === 0) {
                list.innerHTML = `<div class="notification-empty"><i data-lucide="bell-off"></i><p>No new notifications</p></div>`;
            } else {
                list.innerHTML = notifications.map(n => `
                    <div class="notification-item" onclick="window.location.hash='${n.link}'">
                        <div class="notification-icon"><i data-lucide="${n.icon}"></i></div>
                        <div class="notification-content">
                            <p><strong>${n.title}</strong>: ${n.text}</p>
                            <span>${n.time}</span>
                        </div>
                    </div>
                `).join('');
            }
            if (window.lucide) lucide.createIcons({ attrs: { class: ['notification-icon-svg'] } });
        } catch (e) { console.error('Notification error:', e); }
    }

    window.clearNotifications = () => {
        const list = document.getElementById('notification-list');
        if (list) list.innerHTML = `<div class="notification-empty"><i data-lucide="bell-off"></i><p>No new notifications</p></div>`;
        if (window.lucide) lucide.createIcons();
    };

    function openMiniCart() {
        document.getElementById('mini-cart')?.classList.add('open');
        document.getElementById('cart-overlay')?.classList.add('open');
        document.body.style.overflow = 'hidden';
        Store.renderMiniCart();
    }

    function closeMiniCart() {
        document.getElementById('mini-cart')?.classList.remove('open');
        document.getElementById('cart-overlay')?.classList.remove('open');
        document.body.style.overflow = '';
    }

    function init() {
        if (window.lucide) lucide.createIcons();
        initHeader();
        Store.updateCartUI();
        Store.updateAuthUI();
        updateSignupBtn();
        window.addEventListener('hashchange', router);
        router();
        setTimeout(() => document.getElementById('loading-screen')?.classList.add('hidden'), 600);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

/* ==========================================================
   routes/orders.js — API سفارش‌ها
   - POST /api/orders      (protected) — ثبت سفارش
   - GET  /api/orders      (protected) — سفارش‌های کاربر
   - GET  /api/orders/:id  (protected) — یک سفارش
   ========================================================== */

import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

const FREE_SHIPPING_THRESHOLD = 5000000;
const FLAT_SHIPPING = 50000;

/* ---------- کمکی ---------- */

function generateOrderId() {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${ts}${rand}`;
}

function loadOrderItems(orderId) {
    return db.prepare(`
        SELECT * FROM order_items WHERE order_id = ? ORDER BY id
    `).all(orderId);
}

function rowToOrder(row, items) {
    return {
        id: row.id,
        userId: row.user_id,
        status: row.status,
        paymentMethod: row.payment_method,
        subtotal: row.subtotal,
        shipping: row.shipping,
        total: row.total,
        customer: {
            fullName:   row.customer_name,
            phone:      row.customer_phone,
            email:      row.customer_email,
            province:   row.customer_province,
            city:       row.customer_city,
            address:    row.customer_address,
            postalCode: row.customer_postal_code,
            notes:      row.customer_notes,
        },
        items: items.map(i => ({
            productId: i.product_id,
            name:      i.name,
            price:     i.price,
            image:     i.image,
            quantity:  i.quantity,
        })),
        createdAt: row.created_at,
    };
}

function loadOrderById(orderId) {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId);
    if (!row) return null;
    return rowToOrder(row, loadOrderItems(orderId));
}

/* ==========================================================
   POST /api/orders — ثبت سفارش جدید
   ⚠️ قیمت‌ها روی سرور محاسبه می‌شوند (نه از فرانت)
   ========================================================== */

router.post('/', requireAuth, (req, res) => {
    try {
        const { customer, paymentMethod, items } = req.body || {};

        /* ---- اعتبارسنجی ورودی ---- */
        if (!customer || typeof customer !== 'object') {
            return res.status(400).json({ error: 'اطلاعات گیرنده الزامی است' });
        }
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'سبد خرید خالی است' });
        }

        const required = ['fullName', 'phone', 'province', 'city', 'address', 'postalCode'];
        for (const field of required) {
            if (!customer[field] || !String(customer[field]).trim()) {
                return res.status(400).json({ error: `فیلد ${field} الزامی است` });
            }
        }

        /* ---- خواندن محصولات از دیتابیس + محاسبه قیمت ---- */
        const getProduct = db.prepare('SELECT * FROM products WHERE id = ?');
        const resolvedItems = [];

        for (const item of items) {
            const productId = Number(item.productId);
            const quantity = Number(item.quantity);

            if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity < 1) {
                return res.status(400).json({ error: 'آیتم سفارش نامعتبر است' });
            }

            const product = getProduct.get(productId);
            if (!product) {
                return res.status(400).json({ error: `محصول ${productId} یافت نشد` });
            }
            if (!product.in_stock) {
                return res.status(400).json({
                    error: `محصول «${product.name}» در حال حاضر موجود نیست`,
                });
            }

            resolvedItems.push({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity,
            });
        }

        const subtotal = resolvedItems.reduce((s, i) => s + i.price * i.quantity, 0);
        const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
        const total = subtotal + shipping;
        const orderId = generateOrderId();
        const now = new Date().toISOString();

        /* ---- تراکنش: درج سفارش + آیتم‌ها ---- */
        const insertOrder = db.prepare(`
            INSERT INTO orders
            (id, user_id, status, payment_method, subtotal, shipping, total,
             customer_name, customer_phone, customer_email,
             customer_province, customer_city, customer_address,
             customer_postal_code, customer_notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertItem = db.prepare(`
            INSERT INTO order_items
            (order_id, product_id, name, price, image, quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        db.transaction(() => {
            insertOrder.run(
                orderId,
                req.user.id,
                'pending',
                paymentMethod || 'cash',
                subtotal,
                shipping,
                total,
                String(customer.fullName).trim(),
                String(customer.phone).trim(),
                customer.email ? String(customer.email).trim() : null,
                String(customer.province).trim(),
                String(customer.city).trim(),
                String(customer.address).trim(),
                String(customer.postalCode).trim(),
                customer.notes ? String(customer.notes).trim() : null,
                now
            );

            for (const item of resolvedItems) {
                insertItem.run(
                    orderId,
                    item.productId,
                    item.name,
                    item.price,
                    item.image,
                    item.quantity
                );
            }
        })();

        const order = loadOrderById(orderId);
        res.status(201).json({ order });
    } catch (err) {
        console.error('[orders/create]', err);
        res.status(500).json({ error: 'خطای سرور' });
    }
});

/* ==========================================================
   GET /api/orders — سفارش‌های کاربر جاری
   ========================================================== */

router.get('/', requireAuth, (req, res) => {
    try {
        const rows = db.prepare(`
            SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
        `).all(req.user.id);

        const orders = rows.map(row => rowToOrder(row, loadOrderItems(row.id)));
        res.json({ orders });
    } catch (err) {
        console.error('[orders/list]', err);
        res.status(500).json({ error: 'خطای سرور' });
    }
});

/* ==========================================================
   GET /api/orders/:id — جزئیات یک سفارش (فقط صاحب)
   ========================================================== */

router.get('/:id', requireAuth, (req, res) => {
    try {
        const order = loadOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ error: 'سفارش یافت نشد' });
        }
        if (order.userId !== req.user.id) {
            return res.status(403).json({ error: 'اجازه دسترسی به این سفارش را ندارید' });
        }
        res.json({ order });
    } catch (err) {
        console.error('[orders/get]', err);
        res.status(500).json({ error: 'خطای سرور' });
    }
});

export default router;
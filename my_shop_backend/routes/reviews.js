import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

/* ---------- کمکی ---------- */

function rowToReview(row) {
    return {
        id: row.id,
        productId: row.product_id,
        userId: row.user_id,
        name: row.name,
        rating: row.rating,
        text: row.text,
        createdAt: row.created_at,
    };
}

/* ==========================================================
   GET /api/products/:productId/reviews
   عمومی — همه می‌توانند ببینند
   ========================================================== */

export function listReviewsHandler(req, res) {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
        return res.status(400).json({ error: 'شناسه محصول نامعتبر است' });
    }

    const rows = db.prepare(`
        SELECT * FROM reviews
        WHERE product_id = ?
        ORDER BY created_at DESC
    `).all(productId);

    res.json({ reviews: rows.map(rowToReview) });
}

/* ==========================================================
   POST /api/products/:productId/reviews
   محافظت‌شده — فقط کاربر لاگین‌کرده
   ========================================================== */

export function createReviewHandler(req, res) {
    const productId = Number(req.params.productId);
    if (!Number.isInteger(productId)) {
        return res.status(400).json({ error: 'شناسه محصول نامعتبر است' });
    }

    const product = db.prepare('SELECT id FROM products WHERE id = ?').get(productId);
    if (!product) {
        return res.status(404).json({ error: 'محصول پیدا نشد' });
    }

    const { name, rating, text } = req.body || {};

    if (!name || !String(name).trim()) {
        return res.status(400).json({ error: 'نام الزامی است' });
    }
    if (!text || !String(text).trim()) {
        return res.status(400).json({ error: 'متن نظر الزامی است' });
    }

    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: 'امتیاز باید بین ۱ تا ۵ باشد' });
    }

    const result = db.prepare(`
        INSERT INTO reviews (product_id, user_id, name, rating, text, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `).run(
        productId,
        req.user.id,
        String(name).trim().slice(0, 50),
        numericRating,
        String(text).trim().slice(0, 500),
        new Date().toISOString()
    );

    const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ review: rowToReview(row) });
}

/* ==========================================================
   DELETE /api/reviews/:id
   محافظت‌شده — فقط صاحب نظر
   ========================================================== */

export function deleteReviewHandler(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'شناسه نظر نامعتبر است' });
    }

    const row = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id);
    if (!row) {
        return res.status(404).json({ error: 'نظر پیدا نشد' });
    }
    if (row.user_id !== req.user.id) {
        return res.status(403).json({ error: 'اجازه حذف این نظر را ندارید' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    res.json({ ok: true });
}

export default router;
/* ==========================================================
   lib/reviewsLogic.js — منطق نظرات (localStorage)
   کلید: shop_reviews_<productId>
   ========================================================== */

const KEY_PREFIX = 'shop_reviews_';

export function loadReviews(productId) {
    try {
        const raw = localStorage.getItem(KEY_PREFIX + productId);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export function saveReviews(productId, reviews) {
    try {
        localStorage.setItem(KEY_PREFIX + productId, JSON.stringify(reviews));
    } catch (err) {
        console.error('[reviewsLogic] saveReviews failed:', err);
    }
}

export function addReview(productId, { name, rating, text }) {
    const reviews = loadReviews(productId);
    const review = {
        id: Date.now(),
        name: String(name || '').trim().slice(0, 50),
        rating: Math.min(5, Math.max(1, Number(rating) || 5)),
        text: String(text || '').trim().slice(0, 500),
        date: new Date().toISOString(),
    };
    const next = [review, ...reviews];
    saveReviews(productId, next);
    return next;
}

export function removeReview(productId, reviewId) {
    const next = loadReviews(productId).filter(r => r.id !== reviewId);
    saveReviews(productId, next);
    return next;
}

export function getAverageRating(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return 0;
    const sum = reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    return sum / reviews.length;
}
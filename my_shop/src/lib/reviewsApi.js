/* ==========================================================
   lib/reviewsApi.js — فراخوانی API نظرات
   ========================================================== */

import { apiFetch } from './apiClient';

export async function fetchReviews(productId) {
    const data = await apiFetch(`/api/products/${productId}/reviews`);
    return data.reviews;
}

export async function createReview(productId, { name, rating, text }) {
    const data = await apiFetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        body: JSON.stringify({ name, rating, text }),
    });
    return data.review;
}

export async function deleteReview(reviewId) {
    await apiFetch(`/api/reviews/${reviewId}`, { method: 'DELETE' });
}
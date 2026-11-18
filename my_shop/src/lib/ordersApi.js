/* ==========================================================
   lib/ordersApi.js — فراخوانی API سفارش‌ها
   ========================================================== */

import { apiFetch } from './apiClient';

export async function fetchOrders() {
    const data = await apiFetch('/api/orders');
    return data.orders;
}

export async function fetchOrder(id) {
    const data = await apiFetch(`/api/orders/${id}`);
    return data.order;
}

export async function createOrder({ customer, paymentMethod, items }) {
    const data = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ customer, paymentMethod, items }),
    });
    return data.order;
}
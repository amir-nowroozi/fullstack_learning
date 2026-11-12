/* ==========================================================
   lib/ordersLogic.js — منطق خالص سفارش‌ها
   بدون React — فقط توابع
   ذخیره: localStorage → shop_orders
   ========================================================== */

const STORAGE_KEY = 'shop_orders';
const FREE_SHIPPING_THRESHOLD = 5000000;  // ۵ میلیون تومان
const FLAT_SHIPPING = 50000;              // ۵۰ هزار تومان

/* ---------- ذخیره/بازیابی ---------- */

export function loadOrders() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch (err) {
        console.error('[ordersLogic] loadOrders failed:', err);
        return [];
    }
}

export function saveOrders(orders) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (err) {
        console.error('[ordersLogic] saveOrders failed:', err);
    }
}

/* ---------- تولید شناسه ---------- */

export function generateOrderId() {
    const ts = Date.now().toString().slice(-8);
    const rand = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${ts}${rand}`;
}

/* ---------- هزینه ارسال ---------- */

export function calculateShipping(subtotal) {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

/* ---------- ایجاد سفارش ---------- */

export function createOrder({
    cart,
    products,
    customer,
    paymentMethod,
    shippingCost = 0,
    userId = null,          // ⭐ برای اتصال سفارش به کاربر لاگین‌کرده
}) {
    // ۱) snapshot از اقلام — قیمت/نام در زمان خرید قفل می‌شود
    const items = cart
        .map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) return null;
            return {
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: item.quantity,
            };
        })
        .filter(Boolean);

    if (items.length === 0) {
        throw new Error('Cannot create order from empty cart');
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const total = subtotal + shippingCost;

    const order = {
        id: generateOrderId(),
        userId,             // ⭐
        createdAt: new Date().toISOString(),
        status: 'pending',
        paymentMethod,
        customer,
        items,
        subtotal,
        shipping: shippingCost,
        total,
    };

    saveOrders([order, ...loadOrders()]);
    return order;
}

export function getOrderById(orderId) {
    return loadOrders().find(o => o.id === orderId);
}

export function updateOrderStatus(orderId, newStatus) {
    const orders = loadOrders();
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx === -1) return null;
    orders[idx] = { ...orders[idx], status: newStatus };
    saveOrders(orders);
    return orders[idx];
}

/* ---------- برچسب‌ها برای نمایش ---------- */

export const ORDER_STATUS_LABELS = {
    pending:   'در انتظار پرداخت',
    paid:      'پرداخت شد',
    shipped:   'ارسال شد',
    delivered: 'تحویل شد',
    cancelled: 'لغو شد',
};

export const PAYMENT_METHOD_LABELS = {
    cash:   'پرداخت در محل',
    online: 'پرداخت آنلاین',
};
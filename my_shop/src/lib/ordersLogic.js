/* ==========================================================
   lib/ordersLogic.js — ثابت‌ها و کمکی‌های نمایشی
   (منطق اصلی سفارش در بک‌اند است)
   ========================================================== */

const FREE_SHIPPING_THRESHOLD = 5000000;
const FLAT_SHIPPING = 50000;

export function calculateShipping(subtotal) {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

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
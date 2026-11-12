/* ==========================================================
   lib/cartLogic.js — منطق خالص سبد
   بدون React — فقط توابع
   ========================================================== */

const STORAGE_KEY = 'shop_cart';

export function loadCart() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function saveCart(cart) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (err) {
        console.error('[cartLogic] saveCart failed:', err);
    }
}

export function clearCartStorage() {
    localStorage.removeItem(STORAGE_KEY);
}

export function addToCart(cart, productId) {
    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        return cart.map(item =>
            item.productId === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
    }
    return [...cart, { productId, quantity: 1 }];
}

export function removeFromCart(cart, productId) {
    return cart.filter(item => item.productId !== productId);
}

export function setQuantity(cart, productId, quantity) {
    if (quantity <= 0) return removeFromCart(cart, productId);
    return cart.map(item =>
        item.productId === productId ? { ...item, quantity } : item
    );
}

export function getCartCount(cart) {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

export function getCartTotal(cart, products) {
    return cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sum;
        return sum + product.price * item.quantity;
    }, 0);
}
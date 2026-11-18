/* ==========================================================
   context/OrdersContext.jsx — مدیریت سفارش‌ها از API
   ========================================================== */

import {
    createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import {
    fetchOrders,
    createOrder as createOrderApi,
} from '../lib/ordersApi';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();
    const cart = useCart();
    const { show } = useToast();

    /* ---------- بارگذاری سفارش‌ها (فقط اگر لاگین است) ---------- */
    const refresh = useCallback(async () => {
        if (!isAuthenticated) {
            setOrders([]);
            return;
        }
        setLoading(true);
        try {
            const data = await fetchOrders();
            setOrders(data);
        } catch (err) {
            console.error('[OrdersContext] refresh failed:', err);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    /* ---------- ثبت سفارش جدید ---------- */
    const create = useCallback(async ({ customer, paymentMethod }) => {
        // فقط productId و quantity می‌فرستیم — قیمت روی سرور محاسبه می‌شود
        const items = cart.cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
        }));

        const order = await createOrderApi({ customer, paymentMethod, items });

        setOrders(prev => [order, ...prev]);
        cart.clear();
        show('سفارش با موفقیت ثبت شد!', 'success');
        return order;
    }, [cart, show]);

    /* ---------- پیدا کردن سفارش از cache ---------- */
    const getById = useCallback((id) => {
        return orders.find(o => o.id === id) || null;
    }, [orders]);

    const value = useMemo(() => ({
        orders, loading, create, getById, refresh,
    }), [orders, loading, create, getById, refresh]);

    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
    const ctx = useContext(OrdersContext);
    if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
    return ctx;
}
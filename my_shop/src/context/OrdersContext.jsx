/* ==========================================================
   context/OrdersContext.jsx — مدیریت سفارش‌ها در کل اپ
   وابسته به: CartContext (برای دسترسی به سبد) و AuthContext
   ========================================================== */

import {
    createContext, useContext, useState, useCallback, useMemo,
} from 'react';
import {
    loadOrders,
    createOrder as createOrderPure,
    calculateShipping,
} from '../lib/ordersLogic';
import { getAllProducts } from '../lib/products';
import { useCart } from './CartContext';
import { useToast } from './ToastContext';
import { useAuth } from './AuthContext';

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
    const [orders, setOrders] = useState(loadOrders);
    const cart = useCart();
    const { show: showToast } = useToast();
    const { user } = useAuth();

    const create = useCallback(({ customer, paymentMethod }) => {
        const subtotal = cart.total;
        const shippingCost = calculateShipping(subtotal);
        const products = getAllProducts();

        const order = createOrderPure({
            cart: cart.cart,
            products,
            customer,
            paymentMethod,
            shippingCost,
            userId: user?.id ?? null,  // ⭐ سفارش به کاربر جاری وصل می‌شود
        });

        setOrders(loadOrders());
        cart.clear();
        showToast('سفارش با موفقیت ثبت شد!', 'success');
        return order;
    }, [cart, showToast, user]);

    const getById = useCallback((id) => {
        return orders.find(o => o.id === id);
    }, [orders]);

    const value = useMemo(
        () => ({ orders, create, getById }),
        [orders, create, getById]
    );

    return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
    const ctx = useContext(OrdersContext);
    if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
    return ctx;
}
import {
    createContext, useContext, useState, useEffect,
    useMemo, useCallback,
} from 'react';
import {
    loadCart, saveCart, clearCartStorage,
    addToCart as addToCartPure,
    removeFromCart as removeFromCartPure,
    setQuantity as setQuantityPure,
    getCartCount, getCartTotal,
} from '../lib/cartLogic';
import { getAllProducts, getProductById } from '../lib/products';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cart, setCart] = useState(loadCart);
    const [isOpen, setIsOpen] = useState(false);
    const { show: showToast } = useToast();

    useEffect(() => { saveCart(cart); }, [cart]);

    // محصولات را با آیتم‌های سبد ترکیب می‌کنیم
    const items = useMemo(
        () => cart
            .map(item => {
                const product = getProductById(item.productId);
                return product ? { ...item, product } : null;
            })
            .filter(Boolean),
        [cart]
    );

    const count = useMemo(() => getCartCount(cart), [cart]);
    const total = useMemo(() => getCartTotal(cart, getAllProducts()), [cart]);

    const add = useCallback((productId) => {
        setCart(prev => addToCartPure(prev, productId));
        const product = getProductById(productId);
        if (product) {
            showToast(`«${product.name}» به سبد اضافه شد`, 'success');
        }
    }, [showToast]);

    const remove = useCallback((productId) => {
        setCart(prev => removeFromCartPure(prev, productId));
    }, []);

    const setQuantity = useCallback((productId, quantity) => {
        setCart(prev => setQuantityPure(prev, productId, quantity));
    }, []);

    const clear = useCallback(() => {
        setCart([]);
        clearCartStorage();
    }, []);

    const open  = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);

    const value = useMemo(() => ({
        cart, items, count, total, isOpen,
        add, remove, setQuantity, clear, open, close,
    }), [cart, items, count, total, isOpen, add, remove, setQuantity, clear, open, close]);

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
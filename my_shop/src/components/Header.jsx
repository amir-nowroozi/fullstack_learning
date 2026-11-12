import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { toPersianDigits } from '../lib/format';

export default function Header() {
    const { theme, toggle } = useTheme();
    const cart = useCart();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const userMenuRef = useRef(null);

    /* mobile drawer */
    useEffect(() => {
        document.body.classList.toggle('menu-open', mobileOpen);
        return () => document.body.classList.remove('menu-open');
    }, [mobileOpen]);

    /* بستن منوها هنگام تغییر مسیر */
    useEffect(() => {
        setMobileOpen(false);
        setUserMenuOpen(false);
    }, [location.pathname]);

    /* بستن منوی کاربر با کلیک بیرون */
    useEffect(() => {
        if (!userMenuOpen) return;
        const handle = (e) => {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, [userMenuOpen]);

    const handleCartClick = () => {
        setMobileOpen(false);
        cart.open();
    };

    const handleLogout = () => {
        logout();
        setUserMenuOpen(false);
        navigate('/');
    };

    const firstName = user?.fullName?.split(' ')[0] || '';

    return (
        <>
            <header className="site-header">
                <div className="container header-inner">
                    <Link to="/" className="logo">وب‌سایت من</Link>

                    <nav>
                        <ul className="menu">
                            <li>
                                <NavLink to="/" end
                                    className={({ isActive }) => (isActive ? 'active' : '')}>
                                    صفحه اصلی
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/shop"
                                    className={({ isActive }) => (isActive ? 'active' : '')}>
                                    فروشگاه
                                </NavLink>
                            </li>
                        </ul>
                    </nav>

                    <div className="header-actions">
                        <button
                            type="button"
                            className={`hamburger-btn ${mobileOpen ? 'active' : ''}`}
                            aria-label="منو"
                            onClick={() => setMobileOpen(v => !v)}
                        >
                            <span></span><span></span><span></span>
                        </button>

                        <button type="button" className="theme-toggle"
                            aria-label="تغییر تم" onClick={toggle}>
                            <span className="theme-icon">
                                {theme === 'dark' ? '☀️' : '🌙'}
                            </span>
                        </button>

                        <button type="button" className="cart-btn" onClick={handleCartClick}>
                            <span className="cart-icon">🛒</span>
                            <span className="cart-label">سبد خرید</span>
                            <span className="cart-count">{toPersianDigits(cart.count)}</span>
                        </button>

                        {/* ⭐ بخش کاربر */}
                        {isAuthenticated ? (
                            <div className="user-menu" ref={userMenuRef}>
                                <button
                                    type="button"
                                    className="user-btn"
                                    onClick={() => setUserMenuOpen(v => !v)}
                                    aria-label="منوی کاربر"
                                >
                                    <span className="user-avatar">
                                        {firstName.charAt(0) || '?'}
                                    </span>
                                    <span className="user-name">{firstName}</span>
                                </button>

                                {userMenuOpen && (
                                    <div className="user-dropdown">
                                        <Link to="/orders" className="user-dropdown-item">
                                            📦 سفارش‌های من
                                        </Link>
                                        <button
                                            type="button"
                                            className="user-dropdown-item danger"
                                            onClick={handleLogout}
                                        >
                                            🚪 خروج
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="login-link">
                                ورود
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            <div
                className={`mobile-menu-overlay ${mobileOpen ? 'open' : ''}`}
                onClick={() => setMobileOpen(false)}
            />
        </>
    );
}
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OrdersProvider } from './context/OrdersContext';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrdersPage from './pages/OrdersPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import ScrollToTop from './components/ScrollToTop'

export default function App() {
    return (
        <ThemeProvider>
            <ToastProvider>
                <AuthProvider>
                    <CartProvider>
                        <OrdersProvider>
                            <ScrollToTop />
                            <Routes>
                                <Route element={<AppLayout />}>
                                    <Route path="/" element={<HomePage />} />
                                    <Route path="/shop" element={<ShopPage />} />
                                    <Route path="/product/:id" element={<ProductPage />} />

                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />

                                    <Route path="/checkout" element={
                                        <ProtectedRoute><CheckoutPage /></ProtectedRoute>
                                    } />
                                    <Route path="/orders" element={
                                        <ProtectedRoute><OrdersPage /></ProtectedRoute>
                                    } />
                                    <Route path="/order-success" element={
                                        <ProtectedRoute><OrderSuccessPage /></ProtectedRoute>
                                    } />

                                    <Route path="*" element={<NotFoundPage />} />
                                </Route>
                            </Routes>
                        </OrdersProvider>
                    </CartProvider>
                </AuthProvider>
            </ToastProvider>
        </ThemeProvider>
    );
}
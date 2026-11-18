/* ==========================================================
   pages/OrderSuccessPage.jsx — جزئیات سفارش (از API)
   ========================================================== */

import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchOrder } from '../lib/ordersApi';
import { formatPrice, toPersianDigits } from '../lib/format';
import {
    ORDER_STATUS_LABELS,
    PAYMENT_METHOD_LABELS,
} from '../lib/ordersLogic';

function formatDate(iso) {
    try {
        const d = new Date(iso);
        return toPersianDigits(d.toLocaleDateString('fa-IR')) + ' — ' +
               toPersianDigits(d.toLocaleTimeString('fa-IR', {
                   hour: '2-digit',
                   minute: '2-digit',
               }));
    } catch { return ''; }
}

export default function OrderSuccessPage() {
    const [params] = useSearchParams();
    const orderId = params.get('id');
    const isNew = params.get('new') === '1';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!orderId) {
            setLoading(false);
            setError('شماره سفارش در آدرس نیست.');
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchOrder(orderId)
            .then(o => { if (!cancelled) setOrder(o); })
            .catch(err => {
                if (!cancelled) setError(err.message || `سفارش «${orderId}» پیدا نشد`);
            })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [orderId]);

    if (loading) {
        return (
            <main className="container">
                <p className="loading-msg" style={{ marginTop: 40 }}>
                    در حال بارگذاری سفارش...
                </p>
            </main>
        );
    }

    if (error || !order) {
        return (
            <main className="container container-narrow">
                <p className="error-msg" style={{ marginTop: 40 }}>
                    {error || 'سفارش پیدا نشد'}
                    <br /><br />
                    <Link to="/orders" className="btn-secondary">سفارش‌های من</Link>
                    {' '}
                    <Link to="/shop" className="btn-primary">بازگشت به فروشگاه</Link>
                </p>
            </main>
        );
    }

    return (
        <main className="container">
            {isNew && (
                <div className="success-banner">
                    <div className="success-icon">✓</div>
                    <h1>سفارش شما با موفقیت ثبت شد!</h1>
                    <p>همکاران ما به‌زودی با شما تماس خواهند گرفت.</p>
                </div>
            )}

            <div className="order-card">
                <div className="order-card-header">
                    <div>
                        <div className="order-id-label">شماره سفارش</div>
                        <div className="order-id-value">{order.id}</div>
                    </div>
                    <span className={`status-badge status-${order.status}`}>
                        {ORDER_STATUS_LABELS[order.status] || order.status}
                    </span>
                </div>

                <div className="order-meta">
                    <div className="meta-row">
                        <span>تاریخ ثبت:</span>
                        <strong>{formatDate(order.createdAt)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>روش پرداخت:</span>
                        <strong>
                            {PAYMENT_METHOD_LABELS[order.paymentMethod] || order.paymentMethod}
                        </strong>
                    </div>
                </div>

                <div className="order-section">
                    <h3>اطلاعات گیرنده</h3>
                    <div className="meta-row">
                        <span>نام:</span>
                        <strong>{order.customer.fullName}</strong>
                    </div>
                    <div className="meta-row">
                        <span>موبایل:</span>
                        <strong dir="ltr">{toPersianDigits(order.customer.phone)}</strong>
                    </div>
                    {order.customer.email && (
                        <div className="meta-row">
                            <span>ایمیل:</span>
                            <strong dir="ltr">{order.customer.email}</strong>
                        </div>
                    )}
                    <div className="meta-row">
                        <span>آدرس:</span>
                        <strong>
                            {order.customer.province}، {order.customer.city}، {order.customer.address}
                        </strong>
                    </div>
                    <div className="meta-row">
                        <span>کد پستی:</span>
                        <strong>{toPersianDigits(order.customer.postalCode)}</strong>
                    </div>
                    {order.customer.notes && (
                        <div className="meta-row">
                            <span>یادداشت:</span>
                            <strong>{order.customer.notes}</strong>
                        </div>
                    )}
                </div>

                <div className="order-section">
                    <h3>اقلام سفارش</h3>
                    {order.items.map(item => (
                        <div key={item.productId} className="order-item">
                            <img src={item.image} alt={item.name} />
                            <div className="order-item-info">
                                <div className="order-item-name">{item.name}</div>
                                <div className="order-item-qty">
                                    {toPersianDigits(item.quantity)} × {formatPrice(item.price)}
                                </div>
                            </div>
                            <div className="order-item-total">
                                {formatPrice(item.price * item.quantity)}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="order-totals">
                    <div className="meta-row">
                        <span>جمع کالاها:</span>
                        <strong>{formatPrice(order.subtotal)}</strong>
                    </div>
                    <div className="meta-row">
                        <span>هزینه ارسال:</span>
                        <strong>
                            {order.shipping === 0 ? 'رایگان' : formatPrice(order.shipping)}
                        </strong>
                    </div>
                    <div className="meta-row grand-total">
                        <span>مبلغ کل:</span>
                        <strong>{formatPrice(order.total)}</strong>
                    </div>
                </div>
            </div>

            <div className="order-actions">
                <Link to="/shop" className="btn-secondary">ادامه خرید</Link>
                <Link to="/orders" className="btn-primary">سفارش‌های من</Link>
            </div>
        </main>
    );
}
/* ==========================================================
   pages/CheckoutPage.jsx — فرم تکمیل خرید
   - پیش‌پر کردن فیلدها از پروفایل کاربر (اگر لاگین است)
   - اعتبارسنجی سمت کلاینت
   - ثبت سفارش و انتقال به order-success
   ========================================================== */

import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, toPersianDigits } from '../lib/format';
import { calculateShipping } from '../lib/ordersLogic';

const PROVINCES = [
    'تهران', 'البرز', 'اصفهان', 'فارس', 'خراسان رضوی',
    'آذربایجان شرقی', 'آذربایجان غربی', 'خوزستان',
    'مازندران', 'گیلان', 'کرمان', 'قم', 'یزد',
    'کرمانشاه', 'هرمزگان', 'سیستان و بلوچستان', 'گلستان',
    'قزوین', 'مرکزی', 'همدان', 'لرستان', 'کردستان',
    'بوشهر', 'اردبیل', 'زنجان', 'سمنان', 'چهارمحال و بختیاری'
];

const INITIAL_FORM = {
    fullName: '', phone: '', email: '',
    province: '', city: '', address: '', postalCode: '', notes: '',
    paymentMethod: 'cash',
};

function validate(form) {
    const errors = [];
    if (form.fullName.length < 3) errors.push('نام و نام خانوادگی را کامل وارد کنید');
    if (!/^09\d{9}$/.test(form.phone.replace(/\s/g, '')))
        errors.push('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
    if (!form.province) errors.push('استان را انتخاب کنید');
    if (form.city.length < 2) errors.push('نام شهر را وارد کنید');
    if (form.address.length < 10) errors.push('آدرس کامل‌تری وارد کنید');
    if (!/^\d{10}$/.test(form.postalCode.replace(/\s/g, '')))
        errors.push('کد پستی باید ۱۰ رقم باشد');
    return errors;
}

export default function CheckoutPage() {
    const cart = useCart();
    const orders = useOrders();
    const { user } = useAuth();
    const { show } = useToast();
    const navigate = useNavigate();

    // ⭐ مقدار اولیه از پروفایل کاربر
    const [form, setForm] = useState(() => ({
        ...INITIAL_FORM,
        fullName: user?.fullName || '',
        phone:    user?.phone || '',
        email:    user?.email || '',
    }));

    const shipping = useMemo(() => calculateShipping(cart.total), [cart.total]);
    const grandTotal = cart.total + shipping;

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const errors = validate(form);
        if (errors.length > 0) {
            errors.forEach(msg => show(msg, 'error', 3500));
            return;
        }
        try {
            const order = orders.create({
                customer: {
                    fullName:   form.fullName.trim(),
                    phone:      form.phone.trim(),
                    email:      form.email.trim(),
                    province:   form.province,
                    city:       form.city.trim(),
                    address:    form.address.trim(),
                    postalCode: form.postalCode.trim(),
                    notes:      form.notes.trim(),
                },
                paymentMethod: form.paymentMethod,
            });
            navigate(`/order-success?id=${order.id}&new=1`);
        } catch (err) {
            console.error('[CheckoutPage] create order failed:', err);
            show('خطا در ثبت سفارش', 'error');
        }
    };

    if (cart.items.length === 0) {
        return (
            <main className="container">
                <div className="empty-cart-state" style={{ marginTop: 40 }}>
                    <div className="empty-icon">🛒</div>
                    <h2>سبد خرید شما خالی است</h2>
                    <p>برای ادامه خرید، به فروشگاه برگردید.</p>
                    <Link to="/shop" className="btn-primary">رفتن به فروشگاه</Link>
                </div>
            </main>
        );
    }

    return (
        <main className="container">
            <h1 className="page-title">تکمیل خرید</h1>

            <div className="checkout-grid">
                <form className="checkout-form" onSubmit={handleSubmit} noValidate>
                    <section className="form-section">
                        <h2>اطلاعات گیرنده</h2>
                        <div className="form-row-2col">
                            <div className="form-row">
                                <label htmlFor="fullName">نام و نام خانوادگی *</label>
                                <input id="fullName" type="text" value={form.fullName}
                                    onChange={handleChange('fullName')} maxLength={80} required />
                            </div>
                            <div className="form-row">
                                <label htmlFor="phone">شماره موبایل *</label>
                                <input id="phone" type="tel" value={form.phone}
                                    onChange={handleChange('phone')} maxLength={11}
                                    dir="ltr" placeholder="09123456789" required />
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="email">ایمیل (اختیاری)</label>
                            <input id="email" type="email" value={form.email}
                                onChange={handleChange('email')} maxLength={80}
                                dir="ltr" placeholder="example@email.com" />
                        </div>
                    </section>

                    <section className="form-section">
                        <h2>آدرس ارسال</h2>
                        <div className="form-row-2col">
                            <div className="form-row">
                                <label htmlFor="province">استان *</label>
                                <select id="province" value={form.province}
                                    onChange={handleChange('province')} required>
                                    <option value="">انتخاب کنید...</option>
                                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <label htmlFor="city">شهر *</label>
                                <input id="city" type="text" value={form.city}
                                    onChange={handleChange('city')} maxLength={40} required />
                            </div>
                        </div>
                        <div className="form-row">
                            <label htmlFor="address">آدرس دقیق پستی *</label>
                            <textarea id="address" rows={3} value={form.address}
                                onChange={handleChange('address')} maxLength={300} required />
                        </div>
                        <div className="form-row">
                            <label htmlFor="postalCode">کد پستی *</label>
                            <input id="postalCode" type="text" value={form.postalCode}
                                onChange={handleChange('postalCode')} maxLength={10}
                                dir="ltr" placeholder="1234567890" required />
                        </div>
                        <div className="form-row">
                            <label htmlFor="notes">یادداشت (اختیاری)</label>
                            <textarea id="notes" rows={2} value={form.notes}
                                onChange={handleChange('notes')} maxLength={300} />
                        </div>
                    </section>

                    <section className="form-section">
                        <h2>روش پرداخت</h2>
                        <div className="payment-options">
                            <label className="payment-option">
                                <input type="radio" name="paymentMethod" value="cash"
                                    checked={form.paymentMethod === 'cash'}
                                    onChange={handleChange('paymentMethod')} />
                                <span className="payment-card">
                                    <strong>💵 پرداخت در محل</strong>
                                    <small>هنگام تحویل کالا پرداخت کنید</small>
                                </span>
                            </label>
                            <label className="payment-option">
                                <input type="radio" name="paymentMethod" value="online"
                                    checked={form.paymentMethod === 'online'}
                                    onChange={handleChange('paymentMethod')} />
                                <span className="payment-card">
                                    <strong>💳 پرداخت آنلاین</strong>
                                    <small>درگاه بانکی (به‌زودی)</small>
                                </span>
                            </label>
                        </div>
                    </section>

                    <button type="submit" className="btn-submit-order">ثبت سفارش</button>
                </form>

                <aside className="order-summary">
                    <h2>خلاصه سفارش</h2>
                    <div className="summary-items">
                        {cart.items.map(item => (
                            <div key={item.productId} className="summary-item">
                                <img src={item.product.image} alt={item.product.name} />
                                <div className="summary-item-info">
                                    <div className="summary-item-name">{item.product.name}</div>
                                    <div className="summary-item-qty">
                                        {toPersianDigits(item.quantity)} × {formatPrice(item.product.price)}
                                    </div>
                                </div>
                                <div className="summary-item-total">
                                    {formatPrice(item.product.price * item.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="summary-totals">
                        <div className="summary-row">
                            <span>جمع کالاها:</span>
                            <strong>{formatPrice(cart.total)}</strong>
                        </div>
                        <div className="summary-row">
                            <span>هزینه ارسال:</span>
                            <strong>{shipping === 0 ? 'رایگان 🎉' : formatPrice(shipping)}</strong>
                        </div>
                        <div className="summary-row grand">
                            <span>مبلغ قابل پرداخت:</span>
                            <strong>{formatPrice(grandTotal)}</strong>
                        </div>
                    </div>
                    <Link to="/shop" className="back-to-shop">← بازگشت به فروشگاه</Link>
                </aside>
            </div>
        </main>
    );
}
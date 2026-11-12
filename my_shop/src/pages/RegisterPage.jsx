import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
    validateEmail, validatePhone, validatePassword,
} from '../lib/authLogic';

export default function RegisterPage() {
    const { register } = useAuth();
    const { show } = useToast();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;

        const errors = [];
        if (form.fullName.trim().length < 3) errors.push('نام و نام خانوادگی را کامل وارد کنید');
        if (!validateEmail(form.email)) errors.push('ایمیل معتبر نیست');
        if (!validatePhone(form.phone)) errors.push('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد');
        if (!validatePassword(form.password)) errors.push('رمز عبور باید حداقل ۸ کاراکتر باشد');
        if (form.password !== form.confirmPassword) errors.push('رمز عبور و تکرار آن یکسان نیستند');

        if (errors.length > 0) {
            errors.forEach(msg => show(msg, 'error', 3500));
            return;
        }

        setSubmitting(true);
        try {
            await register({
                email: form.email,
                password: form.password,
                fullName: form.fullName,
                phone: form.phone,
            });
            show('حساب کاربری ساخته شد. خوش آمدید!', 'success');
            navigate('/', { replace: true });
        } catch (err) {
            show(err.message || 'خطا در ثبت‌نام', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="container container-narrow">
            <div className="auth-card">
                <h1 className="auth-title">ثبت‌نام</h1>
                <p className="auth-subtitle">یک حساب جدید بسازید.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <label htmlFor="fullName">نام و نام خانوادگی *</label>
                        <input
                            id="fullName"
                            type="text"
                            value={form.fullName}
                            onChange={handleChange('fullName')}
                            maxLength={80}
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="email">ایمیل *</label>
                        <input
                            id="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange('email')}
                            dir="ltr"
                            placeholder="example@email.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="phone">شماره موبایل *</label>
                        <input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange('phone')}
                            dir="ltr"
                            placeholder="09123456789"
                            maxLength={11}
                            autoComplete="tel"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="password">رمز عبور *</label>
                        <input
                            id="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange('password')}
                            dir="ltr"
                            placeholder="حداقل ۸ کاراکتر"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="confirmPassword">تکرار رمز عبور *</label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={form.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            dir="ltr"
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-order"
                        disabled={submitting}
                    >
                        {submitting ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
                    </button>
                </form>

                <p className="auth-switch">
                    قبلاً ثبت‌نام کرده‌اید؟ <Link to="/login">وارد شوید</Link>
                </p>
            </div>
        </main>
    );
}
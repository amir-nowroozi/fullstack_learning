import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage() {
    const { login } = useAuth();
    const { show } = useToast();
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const redirect = params.get('redirect') || '/';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            await login(email, password);
            show('خوش آمدید!', 'success');
            navigate(redirect, { replace: true });
        } catch (err) {
            show(err.message || 'خطا در ورود', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="container container-narrow">
            <div className="auth-card">
                <h1 className="auth-title">ورود به حساب</h1>
                <p className="auth-subtitle">برای ادامه، وارد حساب کاربری خود شوید.</p>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="form-row">
                        <label htmlFor="email">ایمیل *</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            dir="ltr"
                            placeholder="example@email.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label htmlFor="password">رمز عبور *</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            dir="ltr"
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-submit-order"
                        disabled={submitting}
                    >
                        {submitting ? 'در حال ورود...' : 'ورود'}
                    </button>
                </form>

                <p className="auth-switch">
                    حساب ندارید؟ <Link to="/register">ثبت‌نام کنید</Link>
                </p>
            </div>
        </main>
    );
}
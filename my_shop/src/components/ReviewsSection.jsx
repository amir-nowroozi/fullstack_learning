import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviews } from '../hooks/useReviews';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { toPersianDigits } from '../lib/format';
import StarRating from './StarRating';

function formatDate(iso) {
    try {
        return toPersianDigits(new Date(iso).toLocaleDateString('fa-IR'));
    } catch { return ''; }
}

export default function ReviewsSection({ productId }) {
    const { reviews, loading, error, add, remove, average } = useReviews(productId);
    const { user, isAuthenticated } = useAuth();
    const { show } = useToast();

    const [name, setName] = useState(user?.fullName || '');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) {
            show('نام و متن نظر را پر کنید.', 'warning');
            return;
        }
        setSubmitting(true);
        try {
            await add({ name: name.trim(), rating, text: text.trim() });
            show('نظر شما ثبت شد. ممنون!', 'success');
            setText('');
            setRating(5);
            setName(user?.fullName || '');
        } catch (err) {
            show(err.message || 'خطا در ثبت نظر', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemove = async (reviewId) => {
        try {
            await remove(reviewId);
            show('نظر حذف شد', 'info');
        } catch (err) {
            show(err.message || 'خطا در حذف نظر', 'error');
        }
    };

    return (
        <section className="reviews-section">
            <h2>نظرات کاربران</h2>

            {loading && (
                <p className="loading-msg">در حال بارگذاری نظرات...</p>
            )}

            {error && (
                <p className="error-msg">⚠️ {error}</p>
            )}

            {!loading && !error && reviews.length === 0 && (
                <p className="no-reviews">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
            )}

            {!loading && reviews.length > 0 && (
                <>
                    <div className="review-summary">
                        <div className="avg-rating">
                            <span className="avg-number">{toPersianDigits(average.toFixed(1))}</span>
                            <StarRating value={average} readOnly />
                            <span className="avg-count">
                                ({toPersianDigits(reviews.length)} نظر)
                            </span>
                        </div>
                    </div>

                    <div className="reviews-list">
                        {reviews.map(r => {
                            const canDelete = user && r.userId === user.id;
                            return (
                                <article key={r.id} className="review-item">
                                    <div className="review-header">
                                        <strong className="review-name">{r.name}</strong>
                                        <StarRating value={r.rating} readOnly size="sm" />
                                        <span className="review-date">{formatDate(r.createdAt)}</span>
                                        {canDelete && (
                                            <button
                                                className="review-remove"
                                                type="button"
                                                onClick={() => handleRemove(r.id)}
                                                title="حذف نظر شما"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                    <p className="review-text">{r.text}</p>
                                </article>
                            );
                        })}
                    </div>
                </>
            )}

            {isAuthenticated ? (
                <form className="review-form" onSubmit={handleSubmit}>
                    <h3>ثبت نظر جدید</h3>

                    <div className="form-row">
                        <label htmlFor="reviewName">نام شما</label>
                        <input
                            id="reviewName"
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={50}
                            placeholder="مثلاً علی"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <label>امتیاز</label>
                        <StarRating value={rating} onChange={setRating} size="lg" />
                    </div>

                    <div className="form-row">
                        <label htmlFor="reviewText">نظر شما</label>
                        <textarea
                            id="reviewText"
                            value={text}
                            onChange={e => setText(e.target.value)}
                            rows={4}
                            maxLength={500}
                            placeholder="تجربه‌تان از این محصول..."
                            required
                        />
                    </div>

                    <button type="submit" className="btn-submit" disabled={submitting}>
                        {submitting ? 'در حال ثبت...' : 'ثبت نظر'}
                    </button>
                </form>
            ) : (
                <div className="review-login-prompt">
                    <p>برای ثبت نظر، ابتدا وارد حساب کاربری خود شوید.</p>
                    <Link to="/login" className="btn-primary">ورود به حساب</Link>
                </div>
            )}
        </section>
    );
}
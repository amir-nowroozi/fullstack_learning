import { useState } from 'react';
import { useReviews } from '../hooks/useReviews';
import { useToast } from '../context/ToastContext';
import { toPersianDigits } from '../lib/format';
import StarRating from './StarRating';

function formatDate(iso) {
    try {
        return toPersianDigits(new Date(iso).toLocaleDateString('fa-IR'));
    } catch { return ''; }
}

export default function ReviewsSection({ productId }) {
    const { reviews, add, remove, average } = useReviews(productId);
    const { show } = useToast();
    const [name, setName] = useState('');
    const [rating, setRating] = useState(5);
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || !text.trim()) {
            show('نام و متن نظر را پر کنید.', 'warning');
            return;
        }
        add({ name: name.trim(), rating, text: text.trim() });
        show('نظر شما ثبت شد. ممنون!', 'success');
        setName('');
        setRating(5);
        setText('');
    };

    const handleRemove = (reviewId) => {
        remove(reviewId);
        show('نظر حذف شد', 'info');
    };

    return (
        <section className="reviews-section">
            <h2>نظرات کاربران</h2>

            {reviews.length === 0 ? (
                <p className="no-reviews">هنوز نظری ثبت نشده. اولین نفر باشید!</p>
            ) : (
                <div className="review-summary">
                    <div className="avg-rating">
                        <span className="avg-number">{toPersianDigits(average.toFixed(1))}</span>
                        <StarRating value={average} readOnly />
                        <span className="avg-count">({toPersianDigits(reviews.length)} نظر)</span>
                    </div>
                </div>
            )}

            {reviews.length > 0 && (
                <div className="reviews-list">
                    {reviews.map(r => (
                        <article key={r.id} className="review-item">
                            <div className="review-header">
                                <strong className="review-name">{r.name}</strong>
                                <StarRating value={r.rating} readOnly size="sm" />
                                <span className="review-date">{formatDate(r.date)}</span>
                                <button className="review-remove" type="button"
                                    onClick={() => handleRemove(r.id)}>
                                    ✕
                                </button>
                            </div>
                            <p className="review-text">{r.text}</p>
                        </article>
                    ))}
                </div>
            )}

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

                <button type="submit" className="btn-submit">ثبت نظر</button>
            </form>
        </section>
    );
}
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    fetchReviews,
    createReview,
    deleteReview,
} from '../lib/reviewsApi';

export function useReviews(productId) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /* بارگذاری اولیه */
    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);

        fetchReviews(productId)
            .then(data => {
                if (!cancelled) setReviews(data);
            })
            .catch(err => {
                if (!cancelled) setError(err.message || 'خطا در بارگذاری نظرات');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [productId]);

    /* افزودن نظر */
    const add = useCallback(async ({ name, rating, text }) => {
        const created = await createReview(productId, { name, rating, text });
        setReviews(prev => [created, ...prev]);
        return created;
    }, [productId]);

    /* حذف نظر */
    const remove = useCallback(async (reviewId) => {
        await deleteReview(reviewId);
        setReviews(prev => prev.filter(r => r.id !== reviewId));
    }, []);

    /* میانگین */
    const average = useMemo(() => {
        if (!reviews.length) return 0;
        const sum = reviews.reduce((s, r) => s + r.rating, 0);
        return sum / reviews.length;
    }, [reviews]);

    return { reviews, loading, error, add, remove, average };
}
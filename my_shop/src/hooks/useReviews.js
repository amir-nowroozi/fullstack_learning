import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    loadReviews,
    addReview as addPure,
    removeReview as removePure,
    getAverageRating,
} from '../lib/reviewsLogic';

export function useReviews(productId) {
    const [reviews, setReviews] = useState(() => loadReviews(productId));

    useEffect(() => {
        setReviews(loadReviews(productId));
    }, [productId]);

    const add = useCallback(({ name, rating, text }) => {
        const next = addPure(productId, { name, rating, text });
        setReviews(next);
    }, [productId]);

    const remove = useCallback((reviewId) => {
        const next = removePure(productId, reviewId);
        setReviews(next);
    }, [productId]);

    const average = useMemo(() => getAverageRating(reviews), [reviews]);

    return { reviews, add, remove, average };
}
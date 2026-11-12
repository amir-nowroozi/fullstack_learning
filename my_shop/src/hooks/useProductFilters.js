/* ==========================================================
   hooks/useProductFilters.js
   - URL به عنوان منبع حقیقت (shareable links)
   - searchInput محلی برای پاسخ‌دهی فوری + debounce
   ========================================================== */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { filterProducts, sortProducts } from '../lib/filters';

const DEBOUNCE_MS = 300;

export function useProductFilters(products) {
    const [searchParams, setSearchParams] = useSearchParams();

    // مقدار اولیه از URL
    const [searchInput, setSearchInput] = useState(
        () => searchParams.get('q') || ''
    );

    // Debounce: searchInput → URL
    useEffect(() => {
        const t = setTimeout(() => {
            setSearchParams(prev => {
                const next = new URLSearchParams(prev);
                const trimmed = searchInput.trim();
                if (trimmed) next.set('q', trimmed);
                else next.delete('q');
                return next;
            }, { replace: true });
        }, DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchInput, setSearchParams]);

    // خواندن فیلترها از URL
    const filters = {
        search:     searchParams.get('q') || '',
        category:   searchParams.get('cat') || '',
        sort:       searchParams.get('sort') || 'default',
        onlyInStock: searchParams.get('instock') === '1',
    };

    // فیلتر و مرتب‌سازی
    const result = useMemo(() => {
        const filtered = filterProducts(products, filters);
        return sortProducts(filtered, filters.sort);
    }, [products, filters.search, filters.category, filters.sort, filters.onlyInStock]);

    // به‌روزرسانی یک فیلتر در URL
    const updateFilter = (key, value) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            const shouldDelete = !value || (key === 'sort' && value === 'default');
            if (shouldDelete) next.delete(key);
            else next.set(key, value);
            return next;
        }, { replace: true });
    };

    return { filters, result, searchInput, setSearchInput, updateFilter };
}
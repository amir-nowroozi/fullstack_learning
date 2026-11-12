/* ==========================================================
   lib/filters.js — منطق خالص فیلتر و مرتب‌سازی
   بدون React — فقط توابع
   ========================================================== */

/* ---------- نرمال‌سازی متن فارسی ---------- */
export function normalizePersian(text) {
    return String(text || '')
        .toLowerCase()
        .replace(/ي/g, 'ی')
        .replace(/ك/g, 'ک')
        .replace(/ة/g, 'ه')
        .replace(/[\u064B-\u065F\u0670]/g, '')
        .replace(/\u200C/g, ' ')
        .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
        .replace(/\s+/g, ' ')
        .trim();
}

/* ---------- تطابق نام محصول با جست‌وجو ---------- */
export function matchesProductName(product, query) {
    const queryNorm = normalizePersian(query);
    if (!queryNorm) return true;

    const nameNorm = normalizePersian(product.name);
    const nameCompact = nameNorm.replace(/\s/g, '');
    const queryCompact = queryNorm.replace(/\s/g, '');

    return nameNorm.includes(queryNorm) || nameCompact.includes(queryCompact);
}

/* ---------- اعمال فیلترها ---------- */
export function filterProducts(products, filters) {
    let list = [...products];

    if (filters.search) {
        list = list.filter(p => matchesProductName(p, filters.search));
    }
    if (filters.category) {
        list = list.filter(p => p.category === filters.category);
    }
    if (filters.onlyInStock) {
        list = list.filter(p => p.inStock);
    }

    return list;
}

/* ---------- مرتب‌سازی ---------- */
export function sortProducts(products, sort) {
    const list = [...products];
    switch (sort) {
        case 'price-asc':  return list.sort((a, b) => a.price - b.price);
        case 'price-desc': return list.sort((a, b) => b.price - a.price);
        case 'newest':     return list.sort((a, b) => b.id - a.id);
        default:           return list;
    }
}


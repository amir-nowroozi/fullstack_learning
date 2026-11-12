import { CATEGORY_LABELS } from '../lib/products';
import { toPersianDigits } from '../lib/format';

export default function ShopToolbar({
    filters,
    onChange,
    searchInput,
    setSearchInput,
    categories,
    resultCount,
    totalCount,
}) {
    return (
        <section className="shop-toolbar" aria-label="ابزارهای فروشگاه">
            <input
                type="search"
                placeholder="جست‌وجوی محصول..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                autoComplete="off"
            />

            <select
                value={filters.category}
                onChange={e => onChange('cat', e.target.value)}
                aria-label="دسته‌بندی"
            >
                <option value="">همه دسته‌ها</option>
                {categories.map(c => (
                    <option key={c} value={c}>
                        {CATEGORY_LABELS[c] || c}
                    </option>
                ))}
            </select>

            <select
                value={filters.sort}
                onChange={e => onChange('sort', e.target.value)}
                aria-label="مرتب‌سازی"
            >
                <option value="default">مرتب‌سازی: پیش‌فرض</option>
                <option value="price-asc">ارزان‌ترین</option>
                <option value="price-desc">گران‌ترین</option>
                <option value="newest">جدیدترین</option>
            </select>

            <label className="filter-checkbox">
                <input
                    type="checkbox"
                    checked={filters.onlyInStock}
                    onChange={e => onChange('instock', e.target.checked ? '1' : '')}
                />
                <span>فقط موجود</span>
            </label>

            <span className="result-count">
                {resultCount === totalCount
                    ? `${toPersianDigits(resultCount)} محصول`
                    : `${toPersianDigits(resultCount)} از ${toPersianDigits(totalCount)}`}
            </span>
        </section>
    );
}
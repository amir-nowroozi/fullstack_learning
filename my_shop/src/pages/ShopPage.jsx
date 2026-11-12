import { useMemo } from 'react';
import { getAllProducts, getProductCategories } from '../lib/products';
import { useProductFilters } from '../hooks/useProductFilters';
import ShopToolbar from '../components/ShopToolbar';
import ProductCard from '../components/ProductCard';

export default function ShopPage() {
    const allProducts = getAllProducts();               // reference پایدار
    const categories = useMemo(() => getProductCategories(), []);
    const { filters, result, searchInput, setSearchInput, updateFilter } =
        useProductFilters(allProducts);

    return (
        <main className="container">
            <section className="shop-hero">
                <h1>فروشگاه لوازم کامپیوتر</h1>
                <p>جدیدترین لوازم جانبی و قطعات کامپیوتر با بهترین قیمت</p>
            </section>

            <ShopToolbar
                filters={filters}
                onChange={updateFilter}
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                categories={categories}
                resultCount={result.length}
                totalCount={allProducts.length}
            />

            <section className="products-grid">
                {result.length === 0 ? (
                    <p className="empty-state">محصولی با این فیلتر یافت نشد.</p>
                ) : (
                    result.map(p => <ProductCard key={p.id} product={p} />)
                )}
            </section>
        </main>
    );
}
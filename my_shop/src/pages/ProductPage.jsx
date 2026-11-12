/* ==========================================================
   pages/ProductPage.jsx — صفحه جزئیات کامل هر محصول
   - خواندن :id از URL
   - نمایش: تصویر، نام، قیمت، توضیح کامل، مشخصات، دکمه خرید
   - نظرات کاربران
   ========================================================== */

import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../lib/products';
import { useCart } from '../context/CartContext';
import { formatPrice, toPersianDigits } from '../lib/format';
import ReviewsSection from '../components/ReviewsSection';

function getBadge(product) {
    if (!product.inStock) return { type: 'out', text: 'ناموجود' };
    if (product.isNew)    return { type: 'new', text: 'جدید' };
    if (product.oldPrice && product.oldPrice > product.price) {
        const percent = Math.round((1 - product.price / product.oldPrice) * 100);
        return { type: 'discount', text: `${toPersianDigits(percent)}٪ تخفیف` };
    }
    return null;
}

export default function ProductPage() {
    const { id } = useParams();
    const product = getProductById(id);
    const cart = useCart();

    /* محصول پیدا نشد */
    if (!product) {
        return (
            <main className="container container-narrow">
                <p className="error-msg" style={{ marginTop: 40 }}>
                    محصول مورد نظر پیدا نشد.
                    <br /><br />
                    <Link to="/shop" className="btn-primary">بازگشت به فروشگاه</Link>
                </p>
            </main>
        );
    }

    const badge = getBadge(product);

    return (
        <main className="container">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to="/shop">فروشگاه</Link>
                <span>/</span>
                <span>{product.name}</span>
            </nav>

            {/* گرید اصلی: تصویر + اطلاعات */}
            <div className="product-detail-grid">
                {/* ستون تصویر */}
                <div className="product-detail-image">
                    <img src={product.image} alt={product.name} />
                    {badge && (
                        <span className={`badge badge-${badge.type}`}>{badge.text}</span>
                    )}
                </div>

                {/* ستون اطلاعات */}
                <div className="product-detail-info">
                    <h1 className="product-detail-name">{product.name}</h1>

                    <div className="product-detail-price">
                        <span className="price-current">{formatPrice(product.price)}</span>
                        {product.oldPrice && (
                            <span className="price-old">{formatPrice(product.oldPrice)}</span>
                        )}
                    </div>

                    {/* توضیحات کامل محصول */}
                    <p className="product-description">
                        {product.description || 'توضیحی ثبت نشده.'}
                    </p>

                    {/* مشخصات فنی */}
                    {product.specs && Object.keys(product.specs).length > 0 && (
                        <div className="specs-box">
                            <h3>مشخصات فنی</h3>
                            <div className="specs-list">
                                {Object.entries(product.specs).map(([key, value]) => (
                                    <div key={key} className="spec-row">
                                        <span className="spec-key">{key}</span>
                                        <span className="spec-value">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* دکمه افزودن به سبد */}
                    <div className="product-actions">
                        <button
                            className="btn-add-lg"
                            type="button"
                            disabled={!product.inStock}
                            onClick={() => cart.add(product.id)}
                        >
                            {product.inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
                        </button>
                    </div>
                </div>
            </div>

            {/* نظرات کاربران */}
            <ReviewsSection productId={product.id} />
        </main>
    );
}
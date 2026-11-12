import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, toPersianDigits } from '../lib/format';

function getBadge(product) {
    if (!product.inStock) return { type: 'out', text: 'ناموجود' };
    if (product.isNew)    return { type: 'new', text: 'جدید' };
    if (product.oldPrice && product.oldPrice > product.price) {
        const percent = Math.round((1 - product.price / product.oldPrice) * 100);
        return { type: 'discount', text: `${toPersianDigits(percent)}٪ تخفیف` };
    }
    return null;
}

export default function ProductCard({ product }) {
    const cart = useCart();
    const navigate = useNavigate();
    const badge = getBadge(product);
    const productUrl = `/product/${product.id}`;

    const handleAdd = (e) => {
        e.stopPropagation();
        cart.add(product.id);
    };

    const handleCardClick = (e) => {
        if (e.target.closest('a, button')) return;
        navigate(productUrl);
    };

    return (
        <article
            className={`product-card ${product.inStock ? '' : 'out-of-stock'}`}
            onClick={handleCardClick}
        >
            <div className="product-image">
                <Link to={productUrl} aria-label={`مشاهده ${product.name}`}>
                    <img src={product.image} alt={product.name} loading="lazy" />
                </Link>
                {badge && (
                    <span className={`badge badge-${badge.type}`}>{badge.text}</span>
                )}
            </div>
            <div className="product-info">
                <h3 className="product-name">
                    <Link to={productUrl}>{product.name}</Link>
                </h3>
                <div className="product-price">
                    <span className="price-current">{formatPrice(product.price)}</span>
                    {product.oldPrice && (
                        <span className="price-old">{formatPrice(product.oldPrice)}</span>
                    )}
                </div>
                <button
                    className="btn-add"
                    type="button"
                    disabled={!product.inStock}
                    onClick={handleAdd}
                >
                    {product.inStock ? 'افزودن به سبد خرید' : 'ناموجود'}
                </button>
            </div>
        </article>
    );
}
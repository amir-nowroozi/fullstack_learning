import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice, toPersianDigits } from '../lib/format';

export default function CartDrawer() {
    const cart = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        cart.close();
        navigate('/checkout');
    };

    return (
        <>
            <div
                className={`cart-overlay ${cart.isOpen ? 'open' : ''}`}
                onClick={cart.close}
            />

            <aside
                className={`cart-drawer ${cart.isOpen ? 'open' : ''}`}
                aria-hidden={!cart.isOpen}
            >
                <div className="cart-header">
                    <h2>سبد خرید</h2>
                    <button
                        className="cart-close"
                        type="button"
                        aria-label="بستن"
                        onClick={cart.close}
                    >
                        ✕
                    </button>
                </div>

                <div className="cart-body">
                    {cart.items.length === 0 ? (
                        <div className="cart-empty">
                            <span className="emoji">🛒</span>
                            سبد خرید شما خالی است.
                        </div>
                    ) : (
                        cart.items.map(item => (
                            <div key={item.productId} className="cart-item">
                                <img
                                    className="cart-item-img"
                                    src={item.product.image}
                                    alt={item.product.name}
                                />
                                <div className="cart-item-info">
                                    <span className="cart-item-name">{item.product.name}</span>
                                    <span className="cart-item-price">
                                        {formatPrice(item.product.price)}
                                    </span>
                                    <div className="qty-control">
                                        <button
                                            className="qty-btn"
                                            type="button"
                                            onClick={() => cart.setQuantity(item.productId, item.quantity - 1)}
                                        >
                                            −
                                        </button>
                                        <span className="qty-num">{toPersianDigits(item.quantity)}</span>
                                        <button
                                            className="qty-btn"
                                            type="button"
                                            onClick={() => cart.add(item.productId)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                                <button
                                    className="cart-remove"
                                    type="button"
                                    onClick={() => cart.remove(item.productId)}
                                >
                                    حذف
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="cart-footer">
                    <div className="cart-total">
                        <span>مبلغ کل:</span>
                        <strong>{formatPrice(cart.total)}</strong>
                    </div>
                    <button
                        className="btn-checkout"
                        type="button"
                        disabled={cart.items.length === 0}
                        onClick={handleCheckout}
                    >
                        تکمیل خرید
                    </button>
                </div>
            </aside>
        </>
    );
}
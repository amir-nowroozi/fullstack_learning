import { Link } from 'react-router-dom';
import { useOrders } from '../context/OrdersContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, toPersianDigits } from '../lib/format';
import { ORDER_STATUS_LABELS } from '../lib/ordersLogic';

function formatDate(iso) {
    try { return toPersianDigits(new Date(iso).toLocaleDateString('fa-IR')); }
    catch { return ''; }
}

export default function OrdersPage() {
    const { orders } = useOrders();
    const { user } = useAuth();

    // ⭐ فقط سفارش‌های همین کاربر
    const userOrders = user
        ? orders.filter(o => o.userId === user.id)
        : [];

    return (
        <main className="container">
            <h1 className="page-title">سفارش‌های من</h1>

            {userOrders.length === 0 ? (
                <div className="empty-state-large">
                    <div className="empty-icon">📦</div>
                    <h2>هنوز سفارشی ندارید</h2>
                    <p>اولین خریدتان را از فروشگاه انجام دهید.</p>
                    <Link to="/shop" className="btn-primary">رفتن به فروشگاه</Link>
                </div>
            ) : (
                userOrders.map(order => (
                    <article key={order.id} className="order-card-compact">
                        <div className="order-compact-header">
                            <div>
                                <div className="order-id-label">شماره سفارش</div>
                                <div className="order-id-value">{order.id}</div>
                            </div>
                            <span className={`status-badge status-${order.status}`}>
                                {ORDER_STATUS_LABELS[order.status] || order.status}
                            </span>
                        </div>
                        <div className="order-compact-meta">
                            <span>📅 {formatDate(order.createdAt)}</span>
                            <span>📦 {toPersianDigits(order.items.length)} کالا</span>
                            <span>💰 {formatPrice(order.total)}</span>
                        </div>
                        <div className="order-compact-actions">
                            <Link to={`/order-success?id=${order.id}`} className="btn-secondary">
                                مشاهده جزئیات
                            </Link>
                        </div>
                    </article>
                ))
            )}
        </main>
    );
}
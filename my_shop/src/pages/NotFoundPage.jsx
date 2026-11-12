import { Link } from 'react-router-dom';

export default function NotFoundPage() {
    return (
        <main className="container container-narrow">
            <div style={{ padding: '80px 20px', textAlign: 'center' }}>
                <h1>۴۰۴ — صفحه پیدا نشد</h1>
                <p style={{ color: '#6b7280', margin: '16px 0 24px' }}>
                    این صفحه وجود ندارد یا حذف شده است.
                </p>
                <Link to="/" className="btn-primary">بازگشت به خانه</Link>
            </div>
        </main>
    );
}
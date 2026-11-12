/* نمایش یا ورودی ستاره
   - readOnly: فقط نمایش
   - onChange: ورودی تعاملی
*/
export default function StarRating({
    value = 0,
    onChange,
    size = 'md',
    readOnly = false,
    ariaLabel = 'امتیاز',
}) {
    const stars = [1, 2, 3, 4, 5];
    const isInteractive = !readOnly && typeof onChange === 'function';

    const sizeStyle = size === 'lg' ? { fontSize: '2rem' }
                    : size === 'sm' ? { fontSize: '1rem' }
                    : { fontSize: '1.4rem' };

    if (!isInteractive) {
        const full = Math.round(value);
        return (
            <span className="star-rating-display" aria-label={`${ariaLabel}: ${value} از ۵`}>
                {'★'.repeat(full)}{'☆'.repeat(5 - full)}
            </span>
        );
    }

    return (
        <div className="star-rating-input" role="group" aria-label={ariaLabel}>
            {stars.map(n => (
                <button
                    key={n}
                    type="button"
                    onClick={() => onChange(n)}
                    className={`star-btn ${n <= value ? 'active' : ''}`}
                    style={sizeStyle}
                    aria-label={`${n} ستاره`}
                >
                    ★
                </button>
            ))}
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

function ToastItem({ toast }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    return (
        <div className={`toast toast-${toast.type} ${visible ? 'show' : ''}`}>
            <span className="toast-icon">{ICONS[toast.type] || ICONS.info}</span>
            <span className="toast-message">{toast.message}</span>
        </div>
    );
}

export default function ToastContainer() {
    const { toasts } = useToast();
    return (
        <div className="toast-container" aria-live="polite">
            {toasts.map(t => <ToastItem key={t.id} toast={t} />)}
        </div>
    );
}
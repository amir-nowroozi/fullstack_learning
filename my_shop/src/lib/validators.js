/* ==========================================================
   lib/validators.js — اعتبارسنجی سمت کلاینت
   (سمت سرور هم دوباره چک می‌شود — این فقط برای UX بهتر)
   ========================================================== */

export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
    return /^09\d{9}$/.test(String(phone).replace(/\s/g, ''));
}

export function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
}
/* ==========================================================
   lib/authLogic.js — منطق احراز هویت (localStorage)
   ========================================================== */

const USERS_KEY = 'shop_users';
const SESSION_KEY = 'shop_session';

/* ---------- Hash پسورد (SHA-256) ---------- */
export async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const buffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

/* ---------- ذخیره/بازیابی ---------- */
export function loadUsers() {
    try {
        const raw = localStorage.getItem(USERS_KEY);
        const data = raw ? JSON.parse(raw) : [];
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export function saveUsers(users) {
    try {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (err) {
        console.error('[authLogic] saveUsers failed:', err);
    }
}

export function findUserByEmail(email) {
    const normalized = String(email || '').toLowerCase().trim();
    return loadUsers().find(u => u.email === normalized);
}

export function findUserById(id) {
    return loadUsers().find(u => u.id === id);
}

export function generateUserId() {
    return 'USR-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

/* ---------- ثبت‌نام ---------- */
export async function registerUser({ email, password, fullName, phone }) {
    const normalizedEmail = String(email).toLowerCase().trim();

    if (findUserByEmail(normalizedEmail)) {
        throw new Error('این ایمیل قبلاً ثبت شده است');
    }

    const passwordHash = await hashPassword(password);

    const user = {
        id: generateUserId(),
        email: normalizedEmail,
        passwordHash,
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        createdAt: new Date().toISOString(),
    };

    saveUsers([...loadUsers(), user]);
    return publicUser(user);
}

/* ---------- ورود ---------- */
export async function verifyLogin(email, password) {
    const user = findUserByEmail(email);
    if (!user) throw new Error('ایمیل یا رمز عبور اشتباه است');

    const hash = await hashPassword(password);
    if (hash !== user.passwordHash) {
        throw new Error('ایمیل یا رمز عبور اشتباه است');
    }

    return publicUser(user);
}

/* ---------- Session ---------- */
export function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({
        userId: user.id,
        loginAt: new Date().toISOString(),
    }));
}

export function loadSession() {
    try {
        const raw = localStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/* ---------- پاک‌سازی user قبل از دادن به UI ---------- */
function publicUser(user) {
    const { passwordHash, ...safe } = user;
    return safe;
}

/* ---------- اعتبارسنجی ---------- */
export function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone) {
    return /^09\d{9}$/.test(String(phone).replace(/\s/g, ''));
}

export function validatePassword(password) {
    return typeof password === 'string' && password.length >= 8;
}
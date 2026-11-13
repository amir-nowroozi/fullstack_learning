import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const JWT_EXPIRES = '7d';
const SALT_ROUNDS = 10;

/* ---------- کمکی ---------- */

function generateUserId() {
    return 'USR-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function publicUser(row) {
    return {
        id: row.id,
        email: row.email,
        fullName: row.full_name,
        phone: row.phone,
        createdAt: row.created_at,
    };
}

function signToken(userRow) {
    return jwt.sign(
        { sub: userRow.id, email: userRow.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES }
    );
}

/* ---------- POST /api/auth/register ---------- */

router.post('/register', async (req, res) => {
    try {
        const { email, password, fullName, phone } = req.body || {};

        if (!email || !password || !fullName) {
            return res.status(400).json({ error: 'ایمیل، رمز عبور و نام کامل الزامی است' });
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ error: 'ایمیل معتبر نیست' });
        }
        if (String(password).length < 8) {
            return res.status(400).json({ error: 'رمز عبور باید حداقل ۸ کاراکتر باشد' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
        if (existing) {
            return res.status(409).json({ error: 'این ایمیل قبلاً ثبت شده است' });
        }

        const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
        const id = generateUserId();
        const now = new Date().toISOString();

        db.prepare(`
            INSERT INTO users (id, email, password_hash, full_name, phone, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(
            id,
            normalizedEmail,
            passwordHash,
            String(fullName).trim(),
            phone ? String(phone).trim() : null,
            now
        );

        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
        const token = signToken(userRow);

        res.status(201).json({ token, user: publicUser(userRow) });
    } catch (err) {
        console.error('[auth/register]', err);
        res.status(500).json({ error: 'خطای سرور' });
    }
});

/* ---------- POST /api/auth/login ---------- */

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password) {
            return res.status(400).json({ error: 'ایمیل و رمز عبور الزامی است' });
        }

        const normalizedEmail = String(email).toLowerCase().trim();
        const userRow = db.prepare('SELECT * FROM users WHERE email = ?').get(normalizedEmail);
        if (!userRow) {
            return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
        }

        const ok = await bcrypt.compare(String(password), userRow.password_hash);
        if (!ok) {
            return res.status(401).json({ error: 'ایمیل یا رمز عبور اشتباه است' });
        }

        const token = signToken(userRow);
        res.json({ token, user: publicUser(userRow) });
    } catch (err) {
        console.error('[auth/login]', err);
        res.status(500).json({ error: 'خطای سرور' });
    }
});

/* ---------- GET /api/auth/me (محافظت‌شده) ---------- */

router.get('/me', requireAuth, (req, res) => {
    res.json({ user: publicUser(req.user) });
});

export default router;
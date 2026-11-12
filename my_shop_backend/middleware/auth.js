import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

export function requireAuth(req, res, next) {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'توکن احراز هویت لازم است' });
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET);
        const userRow = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
        if (!userRow) {
            return res.status(401).json({ error: 'کاربر یافت نشد' });
        }
        req.user = userRow;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده' });
    }
}
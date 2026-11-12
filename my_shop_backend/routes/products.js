import { Router } from 'express';
import db from '../db/index.js';

const router = Router();

/* GET /api/products — لیست همه محصولات */
router.get('/', (req, res) => {
    const rows = db.prepare('SELECT * FROM products ORDER BY id').all();
    res.json({ products: rows.map(rowToProduct) });
});

/* GET /api/products/:id — یک محصول */
router.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        return res.status(400).json({ error: 'Invalid product id' });
    }
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    if (!row) return res.status(404).json({ error: 'Product not found' });
    res.json(rowToProduct(row));
});

/* ---------- تبدیل ستون‌های snake_case به camelCase ---------- */
function rowToProduct(row) {
    return {
        id: row.id,
        name: row.name,
        price: row.price,
        oldPrice: row.old_price,
        image: row.image,
        category: row.category,
        description: row.description,
        specs: row.specs ? JSON.parse(row.specs) : {},
        isNew: !!row.is_new,
        inStock: !!row.in_stock,
    };
}

export default router;
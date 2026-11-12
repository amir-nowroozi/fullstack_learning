import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('▶ Seeding database...');

// ۱) اجرای schema (ساخت جدول‌ها)
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);
console.log('✓ Schema created');

// ۲) خواندن products.json
const dataPath = path.join(__dirname, '..', 'data', 'products.json');
if (!fs.existsSync(dataPath)) {
    console.error(`✗ File not found: ${dataPath}`);
    process.exit(1);
}
const productsData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// ۳) درج محصولات در دیتابیس
const insert = db.prepare(`
    INSERT OR REPLACE INTO products
    (id, name, price, old_price, image, category, description, specs, is_new, in_stock)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertMany = db.transaction((products) => {
    for (const p of products) {
        insert.run(
            p.id,
            p.name,
            p.price,
            p.oldPrice ?? null,
            p.image,
            p.category ?? null,
            p.description ?? null,
            JSON.stringify(p.specs || {}),
            p.isNew ? 1 : 0,
            p.inStock ? 1 : 0
        );
    }
});

insertMany(productsData.products);

const count = db.prepare('SELECT COUNT(*) AS c FROM products').get().c;
console.log(`✓ Seeded ${count} products`);
console.log('✅ Done');
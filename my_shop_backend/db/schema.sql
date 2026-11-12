-- ==========================================
-- Schema فروشگاه
-- ==========================================

CREATE TABLE IF NOT EXISTS users (
    id            TEXT PRIMARY KEY,
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    phone         TEXT,
    created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    price       INTEGER NOT NULL,
    old_price   INTEGER,
    image       TEXT,
    category    TEXT,
    description TEXT,
    specs       TEXT,
    is_new      INTEGER DEFAULT 0,
    in_stock    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS orders (
    id                   TEXT PRIMARY KEY,
    user_id              TEXT,
    status               TEXT NOT NULL DEFAULT 'pending',
    payment_method       TEXT,
    subtotal             INTEGER NOT NULL,
    shipping             INTEGER NOT NULL,
    total                INTEGER NOT NULL,
    customer_name        TEXT NOT NULL,
    customer_phone       TEXT NOT NULL,
    customer_email       TEXT,
    customer_province    TEXT NOT NULL,
    customer_city        TEXT NOT NULL,
    customer_address     TEXT NOT NULL,
    customer_postal_code TEXT NOT NULL,
    customer_notes       TEXT,
    created_at           TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id   TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    name       TEXT NOT NULL,
    price      INTEGER NOT NULL,
    image      TEXT,
    quantity   INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS reviews (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id    TEXT,
    name       TEXT NOT NULL,
    rating     INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    text       TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
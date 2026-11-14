import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import {
    listReviewsHandler,
    createReviewHandler,
    deleteReviewHandler,
} from './routes/reviews.js';                         // ⭐ اضافه
import { requireAuth } from './middleware/auth.js';  // ⭐ اضافه

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* ---------- Middleware ---------- */
app.use(cors());
app.use(express.json());

/* ---------- Routes ---------- */
app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);

/* ⭐ Reviews — nested under products */
app.get('/api/products/:productId/reviews', listReviewsHandler);
app.post('/api/products/:productId/reviews', requireAuth, createReviewHandler);
app.delete('/api/reviews/:id', requireAuth, deleteReviewHandler);

/* ---------- 404 ---------- */
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

/* ---------- Error handler ---------- */
app.use((err, req, res, next) => {
    console.error('[server] error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
    console.log(`\n✓ Backend running at http://localhost:${PORT}\n`);
});
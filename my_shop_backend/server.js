import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import authRouter from './routes/auth.js';
import ordersRouter from './routes/orders.js';               // ⭐ اضافه
import {
    listReviewsHandler,
    createReviewHandler,
    deleteReviewHandler,
} from './routes/reviews.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ ok: true, time: new Date().toISOString() });
});

app.use('/api/products', productsRouter);
app.use('/api/auth', authRouter);
app.use('/api/orders', ordersRouter);                        // ⭐ اضافه

/* Reviews */
app.get('/api/products/:productId/reviews', listReviewsHandler);
app.post('/api/products/:productId/reviews', requireAuth, createReviewHandler);
app.delete('/api/reviews/:id', requireAuth, deleteReviewHandler);

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

app.use((err, req, res, next) => {
    console.error('[server] error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
});

app.listen(PORT, () => {
    console.log(`\n✓ Backend running at http://localhost:${PORT}\n`);
});
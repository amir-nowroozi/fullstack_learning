import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';

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

/* ---------- 404 برای API ---------- */
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

/* ---------- Error handler ---------- */
app.use((err, req, res, next) => {
    console.error('[server] error:', err);
    res.status(500).json({ error: err.message || 'Internal error' });
});

/* ---------- Start ---------- */
app.listen(PORT, () => {
    console.log(`\n✓ Backend running at http://localhost:${PORT}`);
    console.log(`  Health check: http://localhost:${PORT}/api/health`);
    console.log(`  Products:     http://localhost:${PORT}/api/products\n`);
});
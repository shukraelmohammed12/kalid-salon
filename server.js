import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load local development secrets when present. Vercel injects its own
// environment variables at runtime, and dotenv will not overwrite them.
dotenv.config({ path: '.env.local' });
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = Number(process.env.PORT || 3000);
const sql = process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null;
const allowedServices = new Set([
    'Haircut & Styling',
    'Beard Sculpting',
    'Signature Package',
    'Complete Package'
]);

app.use(express.json({ limit: '10kb' }));

app.get('/api/health', async (_req, res) => {
    if (!sql) {
        return res.status(503).json({ ok: false, error: 'DATABASE_URL is not configured.' });
    }

    try {
        await sql`SELECT 1`;
        return res.json({ ok: true });
    } catch (error) {
        console.error('Database health check failed:', error);
        return res.status(503).json({ ok: false, error: 'Database is unavailable.' });
    }
});

app.post('/api/bookings', async (req, res) => {
    if (!sql) {
        return res.status(503).json({ ok: false, error: 'Database is not configured yet.' });
    }

    const name = String(req.body?.from_name || '').trim();
    const phone = String(req.body?.from_phone || '').trim();
    const service = String(req.body?.service || '').trim();
    const message = String(req.body?.message || '').trim();

    if (name.length < 2 || name.length > 100) {
        return res.status(400).json({ ok: false, error: 'Please enter a valid name.' });
    }

    if (phone.length < 7 || phone.length > 30) {
        return res.status(400).json({ ok: false, error: 'Please enter a valid phone number.' });
    }

    if (!allowedServices.has(service)) {
        return res.status(400).json({ ok: false, error: 'Please choose a valid service.' });
    }

    if (message.length > 1000) {
        return res.status(400).json({ ok: false, error: 'Your message is too long.' });
    }

    try {
        const [booking] = await sql`
            INSERT INTO bookings (customer_name, phone, service, message)
            VALUES (${name}, ${phone}, ${service}, ${message || null})
            RETURNING id, created_at
        `;

        return res.status(201).json({
            ok: true,
            bookingId: booking.id,
            createdAt: booking.created_at
        });
    } catch (error) {
        console.error('Booking insert failed:', error);
        return res.status(500).json({ ok: false, error: 'Could not save the booking.' });
    }
});

// Vercel serves files from /public through its CDN. This middleware keeps the
// same static-file behavior when running locally with `npm start`.
app.use(express.static(path.join(__dirname, 'public')));

// Vercel imports the Express app as a serverless function. Start a local
// listener only when running outside Vercel.
if (!process.env.VERCEL) {
    app.listen(port, () => {
        console.log(`Kalid Barber Studio running at http://localhost:${port}`);
        if (!sql) {
            console.warn('DATABASE_URL is missing. Add it to .env before saving bookings.');
        }
    });
}

export default app;

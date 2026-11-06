import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.local' });
dotenv.config();

const databaseUrl = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('DATABASE_URL is missing. Copy .env.example to .env and add your Neon connection string.');
    process.exit(1);
}

const sql = neon(databaseUrl);

await sql`
    CREATE TABLE IF NOT EXISTS bookings (
        id BIGSERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        service VARCHAR(100) NOT NULL,
        message TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
`;

await sql`
    CREATE INDEX IF NOT EXISTS bookings_created_at_idx ON bookings (created_at DESC)
`;

console.log('Bookings table is ready.');

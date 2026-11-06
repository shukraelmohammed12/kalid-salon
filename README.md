# Kalid Barber Studio

This is the Kalid Barber Studio website with a small Neon database backend for customer booking requests.

## Run it locally

1. Create a free project at [Neon](https://neon.tech) and copy its connection string.
2. Copy `.env.example` to `.env` and paste the connection string into `DATABASE_URL`.
3. Install dependencies and create the bookings table:

   ```bash
   npm install
   npm run db:setup
   ```

4. Start the website:

   ```bash
   npm start
   ```

5. Open <http://localhost:3000>.

The booking form saves the customer's name, phone, selected service, message, status, and submission time in the `bookings` table. The API endpoint is `POST /api/bookings`, and `GET /api/health` checks the database connection.

Never put `DATABASE_URL` in browser JavaScript or commit `.env` to Git.

## Deploy to Vercel with Neon

This project is ready to deploy as an Express application on Vercel, with Neon providing PostgreSQL.

1. Push the project to GitHub and import the repository into Vercel.
2. In Vercel project settings, add `DATABASE_URL` using the pooled Neon connection string. Add `DATABASE_URL_UNPOOLED` only if you plan to run database setup from a deployment shell.
3. Select Production and Preview for the environment variables, then redeploy.
4. Run `npm run db:setup` once using the direct/unpooled connection string, or run the SQL in `db/schema.sql` from the Neon SQL Editor.
5. Verify the deployment at `/api/health`; it should return `{ "ok": true }`.

Static website files are stored in `public/` because Vercel serves that directory through its CDN. `server.js` exports the Express app for Vercel and starts a local listener only when running `npm start` outside Vercel.

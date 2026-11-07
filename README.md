# Kalid Barber Studio

This is the Kalid Barber Studio website with a small Neon database backend for customer booking requests.

## Run it locally

1. Create a free project at [Neon](https://neon.tech) and copy its connection string.
2. Copy `.env.example` to `.env` and paste your Neon pooled connection string into `DATABASE_URL`.
3. Install dependencies and create the bookings table:

   ```bash
   npm install
   npm run db:setup
   ```

   `db:setup` uses `DATABASE_URL_UNPOOLED` when it is present, because schema changes
   should use Neon’s direct connection. The running website uses `DATABASE_URL` and
   falls back to the unpooled URL only when the pooled URL is not provided.

4. Start the website:

   ```bash
   npm start
   ```

5. Open <http://localhost:3000>. Visit <http://localhost:3000/api/health> and confirm
   it returns `{ "ok": true }` before testing a booking.

The booking form saves the customer's name, phone, selected service, message, status, and submission time in the `bookings` table. The API endpoint is `POST /api/bookings`, and `GET /api/health` checks the database connection.

Never put `DATABASE_URL` in browser JavaScript or commit `.env` to Git.

## Deploy to Vercel with Neon

This project is ready to deploy as an Express application on Vercel, with Neon providing PostgreSQL.

1. Push the project to GitHub and import the repository into Vercel.
2. In Vercel project settings, add `DATABASE_URL` using the pooled Neon connection string. Add `DATABASE_URL_UNPOOLED` only if you plan to run database setup from a deployment shell.
3. Select Production and Preview for the environment variables, then redeploy.
4. Run `npm run db:setup` once using the direct/unpooled connection string, or run the SQL in `db/schema.sql` from the Neon SQL Editor.
5. Verify the deployment at `/api/health`; it checks both the database connection and that the `bookings` table exists, returning `{ "ok": true }` when ready.

6. Add `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` to Vercel Production and Preview environment variables.
7. Open `/admin` to sign in and manage booking statuses.

Static website files are stored in `public/` because Vercel serves that directory through its CDN. `server.js` exports the Express app for Vercel and starts a local listener only when running `npm start` outside Vercel.

The admin session is an expiring, signed HttpOnly cookie. The password and session secret stay server-side and are never sent to the browser.

## Separate Vercel frontend and Render backend

For a Render backend, configure these Render environment variables:

- `DATABASE_URL`: Neon pooled connection string
- `DATABASE_URL_UNPOOLED`: Neon direct connection string for `npm run db:setup`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`
- `FRONTEND_ORIGIN`: exact Vercel URL, for example `https://your-site.vercel.app`
- `BACKEND_ONLY=true`: prevents Render from serving the website UI

Set the Render service start command to `npm start`. After deployment, verify
`https://your-backend.onrender.com/api/health` returns `{ "ok": true }`.
The Render root URL will return API service information only; the website remains
available from Vercel.

Before deploying the Vercel frontend, edit `public/api-config.js` and set
`window.KALID_API_URL` to the Render service URL without a trailing slash,
for example `https://your-backend.onrender.com`. Redeploy Vercel after changing
that file.

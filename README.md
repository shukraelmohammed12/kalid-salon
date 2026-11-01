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

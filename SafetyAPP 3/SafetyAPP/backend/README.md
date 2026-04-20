# SafeRoute SA Backend

A Node.js + Express backend for the SafeRoute SA public safety navigation app.

## Tech Stack

- Node.js
- Express
- PostgreSQL (Supabase compatible)
- JWT authentication
- Multer photo uploads
- CORS enabled for React frontend

## Setup

1. Copy `.env.example` to `.env` and update the values.
2. Install dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Set up the database using the SQL schema:

   ```bash
   psql $DATABASE_URL -f sql/schema.sql
   ```

   If you are using Supabase, paste the `DATABASE_URL` from your Supabase project.

4. Start the server:

   ```bash
   npm run dev
   ```

## Environment Variables

- `PORT` - backend port
- `CLIENT_URL` - frontend origin allowed by CORS
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - secret key for JWT tokens

## Prisma

- This backend now includes Prisma for database access and schema management.
- After installing dependencies, run:
  ```bash
  npm install
  npx prisma generate
  npm run studio
  ```
- Prisma Studio will open a live browser UI for your database.

## API Endpoints

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Reports

- `POST /api/reports` (protected)
- `GET /api/reports`
- `GET /api/reports/:id`
- `GET /api/reports/nearby?lat=&lng=&radius=`

### Saved Routes

- `POST /api/routes` (protected)
- `GET /api/routes` (protected)
- `DELETE /api/routes/:id` (protected)

### Alerts

- `GET /api/alerts/nearby?lat=&lng=`

## Notes

- Uploaded photos are stored under `backend/uploads` and served from `/uploads`.
- The frontend should use `VITE_API_URL` to point to this backend.

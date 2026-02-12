# Hairdresser Booking MVP

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the server:
   ```bash
   npm run dev
   ```
3. Open the app:
   - Booking UI: http://localhost:3000
   - Admin view: http://localhost:3000/admin.html

## API

- `GET /api/services`
- `GET /api/staff`
- `GET /api/availability?staffId=1&serviceId=1&date=2026-02-12`
- `GET /api/bookings?date=2026-02-12`
- `POST /api/bookings`

## Notes

- Database file is stored at `backend/db/hairdresser.db`.
- Seed data is loaded automatically on first run.

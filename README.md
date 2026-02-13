# Hairdresser Booking MVP (PHP)

## Setup

1. Ensure PHP 8+ with SQLite enabled.
2. Point your web server docroot to `public/`.
3. Open the app:
   - Booking UI: /index.html
   - Admin view: /admin.html

## API

- `GET /api/services`
- `GET /api/staff`
- `GET /api/availability?staffId=1&serviceId=1&date=2026-02-12`
- `GET /api/bookings?date=2026-02-12`
- `POST /api/bookings`

## Notes

- Database file is stored at `data/hairdresser.sqlite`.
- Seed data is loaded automatically on first run.

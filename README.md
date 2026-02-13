# Hairdresser Booking MVP (PHP)

## Setup

1. Ensure PHP 8+ with SQLite enabled.
2. Point your web server docroot to `public/`.
3. Set admin credentials (optional defaults shown below):
   - `ADMIN_USERNAME` (default: `admin`)
   - `ADMIN_PASSWORD` (default: `changeme`)
4. Open the app:
   - Booking UI: /index.html
   - Admin login: /login.html
   - Admin view (requires login): /admin.html

## Docker (local testing)

1. Build and run:
   - `docker compose up --build`
2. Open the app:
   - Booking UI: http://localhost:8080/index.html
   - Admin login: http://localhost:8080/login.html

## API

- `GET /api/services`
- `GET /api/staff`
- `GET /api/availability?staffId=1&serviceId=1&date=2026-02-12`
- `GET /api/bookings?date=2026-02-12`
- `POST /api/bookings`
- `GET /api/admin/session`
- `POST /api/admin/login`
- `POST /api/admin/logout`

## Notes

- Database file is stored at `data/hairdresser.sqlite`.
- Seed data is loaded automatically on first run.

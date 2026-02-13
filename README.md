# Hairdresser Booking MVP (PHP)

## Public URL and hosting

- Public URL: https://studiokamm.ee
- Booking view: https://studiokamm.ee/index.html
- Admin login: https://studiokamm.ee/login.html
- Hosting environment: shared Linux web hosting with PHP + SQLite

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

## Live deployment (pull-only)

Production host is configured so deploys are done with a single `git pull`.

- SSH: `ssh -p 1022 vhost132437ssh@studiokamm.ee`
- Git checkout path: `~/hairdresser`
- Web root symlink: `~/htdocs -> ~/hairdresser/public`
- Data symlink (persistent DB): `~/hairdresser/data -> ~/data`

Deploy command:

- `ssh -p 1022 vhost132437ssh@studiokamm.ee 'cd ~/hairdresser && git pull --ff-only origin main'`

Optional quick smoke checks:

- `curl -s https://studiokamm.ee/api.php/health`
- `curl -s 'https://studiokamm.ee/api.php/availability?staffId=1&serviceId=3&date=2026-02-16'`

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

## Architecture and framework-like approach (MVC roles)

This project uses a lightweight PHP framework-like pattern (router/controller + model-like modules + views), even without a full external framework.

- Controller role (request handling): `public/api.php`
- Model role (data + domain logic): `src/db.php`, `src/booking/availability.php`, `src/booking/validators.php`
- View role (UI): `public/index.html`, `public/admin.html`, `public/login.html` with `public/app.js`, `public/admin.js`, `public/login.js`

Client-server flow in this app:

1. Frontend (`index.html` + JS) sends HTTP requests (`/api/services`, `/api/staff`, `/api/availability`, `/api/bookings`).
2. Backend (`api.php`) validates input, applies business rules, reads/writes SQLite via prepared statements.
3. Backend returns JSON result (success or error), and frontend shows confirmation/error to user.

## Security overview (risks and protections)

- SQL injection risk → mitigated with PDO prepared statements for dynamic queries.
- Unauthorized admin access risk → mitigated with session-based login and `require_admin()` protection on admin bookings API.
- Stored/reflected XSS risk → mitigated by escaping dynamic text in frontend rendering before `innerHTML` output.
- Invalid input / logic abuse risk → mitigated with server-side input validation (`validators.php`) and business-rule checks.
- Double-booking race condition risk → mitigated with DB transaction (`beginTransaction()`), overlap check at write-time, and unique index `idx_bookings_staff_date_start`.

## Code standard

Project follows a consistent written style:

- PHP style: PSR-12-like formatting (4-space indent, clear function boundaries, descriptive names).
- JavaScript style: semicolons omitted consistently, descriptive constants/functions, async/await for API calls.
- Separation of concerns: request handling, domain logic, persistence, and UI are kept in separate files/modules.

## Requirement coverage checklist

- Public booking view exists and is accessible over public URL.
- User can select stylist/date/time, enter contacts, and receives clear success/error feedback.
- Available times are listed by selected stylist/date.
- Double booking is prevented for same stylist/time, including concurrent requests.
- Admin view exists, supports date-based listing, and is protected by login.
- Frontend and backend are clearly separated.
- App is modular (not a single monolithic file), with reusable validation and availability logic.
- Two distinct views are present (public booking + admin), with consistent visual structure.
- Security controls and rationale are documented above.

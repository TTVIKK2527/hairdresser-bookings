import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDb } from './db.js';
import { generateSlots, timeToMinutes, minutesToTime } from './booking/availability.js';
import { validateBookingInput } from './booking/validators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

const db = await initDb();

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.get('/api/services', async (req, res) => {
  const services = await db.all('SELECT * FROM services ORDER BY name');
  res.json(services);
});

app.get('/api/staff', async (req, res) => {
  const staff = await db.all('SELECT * FROM staff ORDER BY name');
  res.json(staff);
});

app.get('/api/availability', async (req, res) => {
  const { staffId, serviceId, date } = req.query;

  if (!staffId || !serviceId || !date) {
    res.status(400).json({ error: 'staffId, serviceId, and date are required.' });
    return;
  }

  const service = await db.get('SELECT * FROM services WHERE id = ?', [serviceId]);
  if (!service) {
    res.status(404).json({ error: 'Service not found.' });
    return;
  }

  const dayOfWeek = new Date(date).getDay();
  const availabilityWindows = await db.all(
    'SELECT start_time, end_time FROM staff_availability WHERE staff_id = ? AND day_of_week = ? ORDER BY start_time',
    [staffId, dayOfWeek]
  );

  if (availabilityWindows.length === 0) {
    res.json({ slots: [] });
    return;
  }

  const bookings = await db.all(
    'SELECT start_time, end_time FROM bookings WHERE staff_id = ? AND date = ? ORDER BY start_time',
    [staffId, date]
  );

  const slots = generateSlots({
    availabilityWindows,
    serviceDuration: service.duration_min,
    bookings
  });

  res.json({ slots });
});

app.get('/api/bookings', async (req, res) => {
  const { date } = req.query;
  const params = [];
  let sql = `
    SELECT
      bookings.id,
      bookings.date,
      bookings.start_time,
      bookings.end_time,
      bookings.customer_name,
      bookings.customer_phone,
      bookings.customer_email,
      bookings.notes,
      staff.name AS staff_name,
      services.name AS service_name,
      services.duration_min
    FROM bookings
    JOIN staff ON staff.id = bookings.staff_id
    JOIN services ON services.id = bookings.service_id
  `;

  if (date) {
    sql += ' WHERE bookings.date = ?';
    params.push(date);
  }

  sql += ' ORDER BY bookings.date, bookings.start_time';

  const bookings = await db.all(sql, params);
  res.json(bookings);
});

app.post('/api/bookings', async (req, res) => {
  const payload = req.body;
  const errors = validateBookingInput(payload);

  if (errors.length > 0) {
    res.status(400).json({ errors });
    return;
  }

  const service = await db.get('SELECT * FROM services WHERE id = ?', [payload.serviceId]);
  const staff = await db.get('SELECT * FROM staff WHERE id = ?', [payload.staffId]);

  if (!service || !staff) {
    res.status(404).json({ error: 'Service or staff not found.' });
    return;
  }

  const dayOfWeek = new Date(payload.date).getDay();
  const availabilityWindows = await db.all(
    'SELECT start_time, end_time FROM staff_availability WHERE staff_id = ? AND day_of_week = ? ORDER BY start_time',
    [payload.staffId, dayOfWeek]
  );

  if (availabilityWindows.length === 0) {
    res.status(400).json({ error: 'Staff is not available on that date.' });
    return;
  }

  const bookings = await db.all(
    'SELECT start_time, end_time FROM bookings WHERE staff_id = ? AND date = ? ORDER BY start_time',
    [payload.staffId, payload.date]
  );

  const slots = generateSlots({
    availabilityWindows,
    serviceDuration: service.duration_min,
    bookings
  });

  if (!slots.includes(payload.startTime)) {
    res.status(409).json({ error: 'Selected time is no longer available.' });
    return;
  }

  const startMinutes = timeToMinutes(payload.startTime);
  const endMinutes = startMinutes + service.duration_min;
  const endTime = minutesToTime(endMinutes);
  const createdAt = new Date().toISOString();

  const result = await db.run(
    `
    INSERT INTO bookings (
      staff_id,
      service_id,
      customer_name,
      customer_phone,
      customer_email,
      date,
      start_time,
      end_time,
      notes,
      created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      payload.staffId,
      payload.serviceId,
      payload.customerName.trim(),
      payload.customerPhone.trim(),
      payload.customerEmail?.trim() || null,
      payload.date,
      payload.startTime,
      endTime,
      payload.notes?.trim() || null,
      createdAt
    ]
  );

  res.status(201).json({
    id: result.lastID,
    staff: staff.name,
    service: service.name,
    date: payload.date,
    startTime: payload.startTime,
    endTime
  });
});

app.listen(PORT, () => {
  console.log(`Hairdresser booking server running on http://localhost:${PORT}`);
});

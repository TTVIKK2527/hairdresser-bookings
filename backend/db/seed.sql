INSERT INTO services (name, duration_min, price_cents) VALUES
  ('Classic Cut', 45, 3500),
  ('Color Refresh', 90, 8500),
  ('Blowout', 30, 2500);

INSERT INTO staff (name, bio) VALUES
  ('Mia Kuusk', 'Precision cuts and modern styles.'),
  ('Leo Saar', 'Color specialist with a bold touch.');

-- 0=Sunday ... 6=Saturday
INSERT INTO staff_availability (staff_id, day_of_week, start_time, end_time) VALUES
  (1, 1, '09:00', '17:00'),
  (1, 2, '09:00', '17:00'),
  (1, 3, '10:00', '18:00'),
  (1, 4, '09:00', '17:00'),
  (1, 5, '09:00', '16:00'),
  (2, 1, '10:00', '18:00'),
  (2, 2, '10:00', '18:00'),
  (2, 3, '10:00', '18:00'),
  (2, 4, '12:00', '20:00'),
  (2, 6, '09:00', '14:00');

<?php

require_once __DIR__ . '/../src/db.php';
require_once __DIR__ . '/../src/booking/availability.php';
require_once __DIR__ . '/../src/booking/validators.php';

function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [];
    }

    return $decoded;
}

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

if ($path === '/api/health') {
    json_response(['ok' => true]);
}

$db = get_db();

if ($path === '/api/services' && $method === 'GET') {
    $stmt = $db->query('SELECT * FROM services ORDER BY name');
    json_response($stmt->fetchAll());
}

if ($path === '/api/staff' && $method === 'GET') {
    $stmt = $db->query('SELECT * FROM staff ORDER BY name');
    json_response($stmt->fetchAll());
}

if ($path === '/api/availability' && $method === 'GET') {
    $staffId = $_GET['staffId'] ?? null;
    $serviceId = $_GET['serviceId'] ?? null;
    $date = $_GET['date'] ?? null;

    if (!$staffId || !$serviceId || !$date) {
        json_response(['error' => 'staffId, serviceId, and date are required.'], 400);
    }

    $serviceStmt = $db->prepare('SELECT * FROM services WHERE id = ?');
    $serviceStmt->execute([$serviceId]);
    $service = $serviceStmt->fetch();
    if (!$service) {
        json_response(['error' => 'Service not found.'], 404);
    }

    $dayOfWeek = (int)(new DateTime($date))->format('w');
    $windowStmt = $db->prepare(
        'SELECT start_time, end_time FROM staff_availability WHERE staff_id = ? AND day_of_week = ? ORDER BY start_time'
    );
    $windowStmt->execute([$staffId, $dayOfWeek]);
    $availabilityWindows = $windowStmt->fetchAll();

    if (count($availabilityWindows) === 0) {
        json_response(['slots' => []]);
    }

    $bookingStmt = $db->prepare(
        'SELECT start_time, end_time FROM bookings WHERE staff_id = ? AND date = ? ORDER BY start_time'
    );
    $bookingStmt->execute([$staffId, $date]);
    $bookings = $bookingStmt->fetchAll();

    $slots = generate_slots($availabilityWindows, (int)$service['duration_min'], $bookings);
    json_response(['slots' => $slots]);
}

if ($path === '/api/bookings' && $method === 'GET') {
    $date = $_GET['date'] ?? null;
    $params = [];
    $sql = "
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
    ";

    if ($date) {
        $sql .= ' WHERE bookings.date = ?';
        $params[] = $date;
    }

    $sql .= ' ORDER BY bookings.date, bookings.start_time';

    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    json_response($stmt->fetchAll());
}

if ($path === '/api/bookings' && $method === 'POST') {
    $payload = read_json_body();
    $errors = validate_booking_input($payload);
    if (count($errors) > 0) {
        json_response(['errors' => $errors], 400);
    }

    $serviceStmt = $db->prepare('SELECT * FROM services WHERE id = ?');
    $serviceStmt->execute([$payload['serviceId']]);
    $service = $serviceStmt->fetch();

    $staffStmt = $db->prepare('SELECT * FROM staff WHERE id = ?');
    $staffStmt->execute([$payload['staffId']]);
    $staff = $staffStmt->fetch();

    if (!$service || !$staff) {
        json_response(['error' => 'Service or staff not found.'], 404);
    }

    $dayOfWeek = (int)(new DateTime($payload['date']))->format('w');
    $windowStmt = $db->prepare(
        'SELECT start_time, end_time FROM staff_availability WHERE staff_id = ? AND day_of_week = ? ORDER BY start_time'
    );
    $windowStmt->execute([$payload['staffId'], $dayOfWeek]);
    $availabilityWindows = $windowStmt->fetchAll();

    if (count($availabilityWindows) === 0) {
        json_response(['error' => 'Staff is not available on that date.'], 400);
    }

    $bookingStmt = $db->prepare(
        'SELECT start_time, end_time FROM bookings WHERE staff_id = ? AND date = ? ORDER BY start_time'
    );
    $bookingStmt->execute([$payload['staffId'], $payload['date']]);
    $bookings = $bookingStmt->fetchAll();

    $slots = generate_slots($availabilityWindows, (int)$service['duration_min'], $bookings);
    if (!in_array($payload['startTime'], $slots, true)) {
        json_response(['error' => 'Selected time is no longer available.'], 409);
    }

    $startMinutes = time_to_minutes($payload['startTime']);
    $endMinutes = $startMinutes + (int)$service['duration_min'];
    $endTime = minutes_to_time($endMinutes);
    $createdAt = (new DateTime())->format(DateTime::ATOM);

    $insertStmt = $db->prepare(
        'INSERT INTO bookings (staff_id, service_id, customer_name, customer_phone, customer_email, date, start_time, end_time, notes, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $insertStmt->execute([
        $payload['staffId'],
        $payload['serviceId'],
        trim($payload['customerName']),
        trim($payload['customerPhone']),
        isset($payload['customerEmail']) ? trim($payload['customerEmail']) : null,
        $payload['date'],
        $payload['startTime'],
        $endTime,
        isset($payload['notes']) ? trim($payload['notes']) : null,
        $createdAt
    ]);

    json_response([
        'id' => (int)$db->lastInsertId(),
        'staff' => $staff['name'],
        'service' => $service['name'],
        'date' => $payload['date'],
        'startTime' => $payload['startTime'],
        'endTime' => $endTime
    ], 201);
}

json_response(['error' => 'Not found.'], 404);

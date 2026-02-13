<?php

function resolve_data_dir(string $baseDir): string
{
    $preferred = $baseDir . '/data';
    if (can_use_sqlite_dir($preferred)) {
        return $preferred;
    }

    $fallback = rtrim(sys_get_temp_dir(), '/') . '/hairdresser-bookings-data';
    if (can_use_sqlite_dir($fallback)) {
        return $fallback;
    }

    throw new RuntimeException('No writable directory available for SQLite database.');
}

function ensure_writable_dir(string $path): bool
{
    if (!is_dir($path) && !mkdir($path, 0775, true) && !is_dir($path)) {
        return false;
    }

    if (!is_writable($path)) {
        @chmod($path, 0775);
    }

    return is_writable($path);
}

function can_use_sqlite_dir(string $path): bool
{
    try {
        $suffix = bin2hex(random_bytes(6));
    } catch (Exception $exception) {
        $suffix = (string)mt_rand(100000, 999999);
    }

    if (!ensure_writable_dir($path)) {
        return false;
    }

    $probe = $path . '/.probe-' . $suffix;
    if (@file_put_contents($probe, 'ok') === false) {
        return false;
    }
    @unlink($probe);

    $dbPath = $path . '/hairdresser.sqlite';
    if (file_exists($dbPath) && !is_writable($dbPath)) {
        @chmod($dbPath, 0664);
    }

    return !file_exists($dbPath) || is_writable($dbPath);
}

function get_db(): PDO
{
    static $db = null;
    if ($db instanceof PDO) {
        return $db;
    }

    $baseDir = dirname(__DIR__);
    $dataDir = resolve_data_dir($baseDir);

    $dbPath = $dataDir . '/hairdresser.sqlite';
    $schemaPath = $baseDir . '/db/schema.sql';
    $seedPath = $baseDir . '/db/seed.sql';

    $db = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $db->exec('PRAGMA foreign_keys = ON');
    $db->exec('PRAGMA busy_timeout = 5000');

    $schemaSql = file_get_contents($schemaPath);
    $db->exec($schemaSql);

    $serviceCount = $db->query('SELECT COUNT(*) AS count FROM services')->fetch();
    if ((int)$serviceCount['count'] === 0) {
        $seedSql = file_get_contents($seedPath);
        $db->exec($seedSql);
    }

    $db->exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_staff_date_start ON bookings (staff_id, date, start_time)');

    return $db;
}

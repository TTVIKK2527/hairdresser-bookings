<?php

function get_db(): PDO
{
    static $db = null;
    if ($db instanceof PDO) {
        return $db;
    }

    $baseDir = dirname(__DIR__);
    $dataDir = $baseDir . '/data';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }

    $dbPath = $dataDir . '/hairdresser.sqlite';
    $schemaPath = $baseDir . '/db/schema.sql';
    $seedPath = $baseDir . '/db/seed.sql';

    $db = new PDO('sqlite:' . $dbPath, null, null, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    $db->exec('PRAGMA foreign_keys = ON');

    if (!file_exists($dbPath) || filesize($dbPath) === 0) {
        $schemaSql = file_get_contents($schemaPath);
        $db->exec($schemaSql);

        $seedSql = file_get_contents($seedPath);
        $db->exec($seedSql);
        return $db;
    }

    $serviceCount = $db->query('SELECT COUNT(*) AS count FROM services')->fetch();
    if ((int)$serviceCount['count'] === 0) {
        $seedSql = file_get_contents($seedPath);
        $db->exec($seedSql);
    }

    return $db;
}

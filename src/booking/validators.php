<?php

function validate_booking_input(array $payload): array
{
    $errors = [];

    if (empty($payload['serviceId'])) {
        $errors[] = 'Service is required.';
    }
    if (empty($payload['staffId'])) {
        $errors[] = 'Staff member is required.';
    }
    if (empty($payload['date']) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $payload['date'])) {
        $errors[] = 'Valid date is required.';
    } elseif (!is_valid_date($payload['date'])) {
        $errors[] = 'Date is invalid.';
    }
    if (empty($payload['startTime']) || !preg_match('/^\d{2}:\d{2}$/', $payload['startTime'])) {
        $errors[] = 'Valid start time is required.';
    } elseif (!is_valid_time($payload['startTime'])) {
        $errors[] = 'Start time is invalid.';
    }
    if (empty($payload['customerName']) || strlen(trim($payload['customerName'])) < 2) {
        $errors[] = 'Customer name is required.';
    }
    if (empty($payload['customerPhone']) || strlen(trim($payload['customerPhone'])) < 6) {
        $errors[] = 'Customer phone is required.';
    }

    return $errors;
}

function is_valid_date(string $date): bool
{
    [$year, $month, $day] = array_map('intval', explode('-', $date));
    return checkdate($month, $day, $year);
}

function is_valid_time(string $time): bool
{
    [$hour, $minute] = array_map('intval', explode(':', $time));
    return $hour >= 0 && $hour <= 23 && $minute >= 0 && $minute <= 59;
}

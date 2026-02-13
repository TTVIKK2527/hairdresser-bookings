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
    }
    if (empty($payload['startTime']) || !preg_match('/^\d{2}:\d{2}$/', $payload['startTime'])) {
        $errors[] = 'Valid start time is required.';
    }
    if (empty($payload['customerName']) || strlen(trim($payload['customerName'])) < 2) {
        $errors[] = 'Customer name is required.';
    }
    if (empty($payload['customerPhone']) || strlen(trim($payload['customerPhone'])) < 6) {
        $errors[] = 'Customer phone is required.';
    }

    return $errors;
}

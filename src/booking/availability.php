<?php

const SLOT_INTERVAL_MIN = 30;

function time_to_minutes(string $time): int
{
    [$hour, $minute] = array_map('intval', explode(':', $time));
    return ($hour * 60) + $minute;
}

function minutes_to_time(int $minutes): string
{
    $hour = intdiv($minutes, 60);
    $minute = $minutes % 60;
    return str_pad((string)$hour, 2, '0', STR_PAD_LEFT) . ':' . str_pad((string)$minute, 2, '0', STR_PAD_LEFT);
}

function overlaps(int $startA, int $endA, int $startB, int $endB): bool
{
    return $startA < $endB && $endA > $startB;
}

function generate_slots(array $availabilityWindows, int $serviceDuration, array $bookings): array
{
    $slots = [];
    $normalizedBookings = array_map(function ($booking) {
        return [
            'start' => time_to_minutes($booking['start_time']),
            'end' => time_to_minutes($booking['end_time'])
        ];
    }, $bookings);

    foreach ($availabilityWindows as $window) {
        $windowStart = time_to_minutes($window['start_time']);
        $windowEnd = time_to_minutes($window['end_time']);

        for ($start = $windowStart; $start + $serviceDuration <= $windowEnd; $start += SLOT_INTERVAL_MIN) {
            $end = $start + $serviceDuration;
            $conflicts = false;

            foreach ($normalizedBookings as $booking) {
                if (overlaps($start, $end, $booking['start'], $booking['end'])) {
                    $conflicts = true;
                    break;
                }
            }

            if (!$conflicts) {
                $slots[] = minutes_to_time($start);
            }
        }
    }

    return $slots;
}

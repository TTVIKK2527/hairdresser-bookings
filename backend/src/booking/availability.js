const SLOT_INTERVAL_MIN = 30;

export function timeToMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

export function minutesToTime(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

export function generateSlots({ availabilityWindows, serviceDuration, bookings }) {
  const slots = [];
  const normalizedBookings = bookings.map((booking) => ({
    start: timeToMinutes(booking.start_time),
    end: timeToMinutes(booking.end_time)
  }));

  availabilityWindows.forEach((window) => {
    const windowStart = timeToMinutes(window.start_time);
    const windowEnd = timeToMinutes(window.end_time);

    for (
      let start = windowStart;
      start + serviceDuration <= windowEnd;
      start += SLOT_INTERVAL_MIN
    ) {
      const end = start + serviceDuration;
      const conflicts = normalizedBookings.some((booking) =>
        overlaps(start, end, booking.start, booking.end)
      );

      if (!conflicts) {
        slots.push(minutesToTime(start));
      }
    }
  });

  return slots;
}

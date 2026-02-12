const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function validateBookingInput(payload) {
  const errors = [];

  if (!payload.serviceId) {
    errors.push('Service is required.');
  }
  if (!payload.staffId) {
    errors.push('Staff member is required.');
  }
  if (!payload.date || !DATE_RE.test(payload.date)) {
    errors.push('Valid date is required.');
  }
  if (!payload.startTime || !TIME_RE.test(payload.startTime)) {
    errors.push('Valid start time is required.');
  }
  if (!payload.customerName || payload.customerName.trim().length < 2) {
    errors.push('Customer name is required.');
  }
  if (!payload.customerPhone || payload.customerPhone.trim().length < 6) {
    errors.push('Customer phone is required.');
  }

  return errors;
}

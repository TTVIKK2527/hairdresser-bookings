const serviceSelect = document.getElementById('service');
const staffSelect = document.getElementById('staff');
const dateInput = document.getElementById('date');
const timeSelect = document.getElementById('time');
const form = document.getElementById('booking-form');
const message = document.getElementById('form-message');
const serviceList = document.getElementById('service-list');
const API_BASE = '/api.php';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const today = new Date();
const todayValue = today.toISOString().slice(0, 10);
dateInput.value = todayValue;
dateInput.min = todayValue;

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Request failed');
  }
  return res.json();
}

async function loadServices() {
  const services = await fetchJson(`${API_BASE}/services`);
  serviceSelect.innerHTML = services
    .map(
      (service) =>
        `<option value="${service.id}">${escapeHtml(service.name)} · ${service.duration_min} min · $${(
          service.price_cents / 100
        ).toFixed(2)}</option>`
    )
    .join('');

  serviceList.innerHTML = services
    .map(
      (service) => `
        <div class="card">
          <h4>${escapeHtml(service.name)}</h4>
          <p>${service.duration_min} min · $${(service.price_cents / 100).toFixed(2)}</p>
        </div>
      `
    )
    .join('');
}

async function loadStaff() {
  const staff = await fetchJson(`${API_BASE}/staff`);
  staffSelect.innerHTML = staff
    .map((person) => `<option value="${person.id}">${escapeHtml(person.name)}</option>`)
    .join('');
}

async function loadSlots() {
  if (!serviceSelect.value || !staffSelect.value || !dateInput.value) {
    return;
  }

  timeSelect.innerHTML = '<option value="">Loading...</option>';
  const params = new URLSearchParams({
    staffId: staffSelect.value,
    serviceId: serviceSelect.value,
    date: dateInput.value
  });

  const data = await fetchJson(`${API_BASE}/availability?${params}`);
  if (data.slots.length === 0) {
    timeSelect.innerHTML = '<option value="">No slots available</option>';
    return;
  }

  timeSelect.innerHTML = data.slots
    .map((slot) => `<option value="${slot}">${slot}</option>`)
    .join('');
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  try {
    const payload = {
      serviceId: serviceSelect.value,
      staffId: staffSelect.value,
      date: dateInput.value,
      startTime: timeSelect.value,
      customerName: document.getElementById('name').value,
      customerPhone: document.getElementById('phone').value,
      customerEmail: document.getElementById('email').value,
      notes: document.getElementById('notes').value
    };

    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      message.textContent = data.error || data.errors?.join(' ') || 'Booking failed.';
      message.style.color = '#b84e2d';
      return;
    }

    message.textContent = `Booked ${data.service} with ${data.staff} at ${data.startTime}.`;
    message.style.color = '#1a6b44';
    form.reset();
    dateInput.value = todayValue;
    await loadSlots();
  } catch (error) {
    message.textContent = 'Something went wrong. Please try again.';
    message.style.color = '#b84e2d';
  }
});

[serviceSelect, staffSelect, dateInput].forEach((input) => {
  input.addEventListener('change', loadSlots);
});

try {
  await loadServices();
  await loadStaff();
  await loadSlots();
} catch (error) {
  message.textContent = 'Could not load booking data. Please refresh the page.';
  message.style.color = '#b84e2d';
}

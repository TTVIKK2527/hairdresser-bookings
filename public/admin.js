const dateInput = document.getElementById('admin-date');
const refreshButton = document.getElementById('refresh');
const bookingList = document.getElementById('booking-list');
const logoutButton = document.getElementById('logout');
const API_BASE = '/api.php';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const todayValue = new Date().toISOString().slice(0, 10);
dateInput.value = todayValue;

async function fetchBookings() {
  const params = new URLSearchParams({ date: dateInput.value });
  const res = await fetch(`${API_BASE}/bookings?${params}`);
  if (res.status === 401) {
    window.location.href = 'login.html';
    return;
  }
  const data = await res.json();

  if (data.length === 0) {
    bookingList.innerHTML = '<p>No bookings yet.</p>';
    return;
  }

  bookingList.innerHTML = data
    .map(
      (booking) => `
        <div class="card">
          <div class="badge">${escapeHtml(booking.start_time)} - ${escapeHtml(booking.end_time)}</div>
          <h4>${escapeHtml(booking.customer_name)}</h4>
          <p>${escapeHtml(booking.service_name)} with ${escapeHtml(booking.staff_name)}</p>
          <p>${escapeHtml(booking.customer_phone)} ${booking.customer_email ? `· ${escapeHtml(booking.customer_email)}` : ''}</p>
          ${booking.notes ? `<p>Notes: ${escapeHtml(booking.notes)}</p>` : ''}
        </div>
      `
    )
    .join('');
}

async function ensureAdminSession() {
  const res = await fetch(`${API_BASE}/admin/session`);
  if (!res.ok) {
    window.location.href = 'login.html';
    return false;
  }

  const data = await res.json();
  if (!data.authenticated) {
    window.location.href = 'login.html';
    return false;
  }

  return true;
}

refreshButton.addEventListener('click', fetchBookings);
dateInput.addEventListener('change', fetchBookings);

if (logoutButton) {
  logoutButton.addEventListener('click', async () => {
    await fetch(`${API_BASE}/admin/logout`, { method: 'POST' });
    window.location.href = 'login.html';
  });
}
const hasSession = await ensureAdminSession();
if (hasSession) {
  await fetchBookings();
}

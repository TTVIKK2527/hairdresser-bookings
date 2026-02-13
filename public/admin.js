const dateInput = document.getElementById('admin-date');
const refreshButton = document.getElementById('refresh');
const bookingList = document.getElementById('booking-list');
const logoutButton = document.getElementById('logout');

const todayValue = new Date().toISOString().slice(0, 10);
dateInput.value = todayValue;

async function fetchBookings() {
  const params = new URLSearchParams({ date: dateInput.value });
  const res = await fetch(`/api/bookings?${params}`);
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
          <div class="badge">${booking.start_time} - ${booking.end_time}</div>
          <h4>${booking.customer_name}</h4>
          <p>${booking.service_name} with ${booking.staff_name}</p>
          <p>${booking.customer_phone} ${booking.customer_email ? `· ${booking.customer_email}` : ''}</p>
          ${booking.notes ? `<p>Notes: ${booking.notes}</p>` : ''}
        </div>
      `
    )
    .join('');
}

async function ensureAdminSession() {
  const res = await fetch('/api/admin/session');
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
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = 'login.html';
  });
}
const hasSession = await ensureAdminSession();
if (hasSession) {
  await fetchBookings();
}

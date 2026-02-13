const dateInput = document.getElementById('admin-date');
const refreshButton = document.getElementById('refresh');
const bookingList = document.getElementById('booking-list');

const todayValue = new Date().toISOString().slice(0, 10);
dateInput.value = todayValue;

async function fetchBookings() {
  const params = new URLSearchParams({ date: dateInput.value });
  const res = await fetch(`/api/bookings?${params}`);
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

refreshButton.addEventListener('click', fetchBookings);
dateInput.addEventListener('change', fetchBookings);

await fetchBookings();

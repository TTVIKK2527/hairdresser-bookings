const form = document.getElementById('login-form');
const message = document.getElementById('login-message');

async function checkSession() {
  const res = await fetch('/api/admin/session');
  if (!res.ok) {
    return;
  }

  const data = await res.json();
  if (data.authenticated) {
    window.location.href = 'admin.html';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  try {
    const payload = {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    };

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      message.textContent = data.error || 'Login failed.';
      message.style.color = '#b84e2d';
      return;
    }

    window.location.href = 'admin.html';
  } catch (error) {
    message.textContent = 'Something went wrong. Please try again.';
    message.style.color = '#b84e2d';
  }
});

await checkSession();

async function signup() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    const res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, phone, password })
    });

    const data = await res.json();

    if (!res.ok) {
        alert(data?.message || data?.error || "Signup failed.");
        return;
    }

    localStorage.setItem('token', data.authToken);
    window.location.href = '/';
}
// Filename: script.js
function register() {
    const fullname = document.getElementById('fullname').value;
    const contact = document.getElementById('contact').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const message = document.getElementById('registrationMessage');

    fetch('http://localhost:3027/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullname, contact, email, password })
    })
    .then(response => response.text())
    .then(data => message.textContent = data)
    .catch(error => message.textContent = 'Failed to register');
}

function login() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const message = document.getElementById('loginMessage');

    fetch('http://localhost:3027/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(response => response.json())  // Parsing the JSON response body
    .then(data => {
        if (data.redirectUrl) {
            // If the response includes a redirectUrl, redirect the user
            window.location.href = data.redirectUrl;
        } else {
            // If there is no redirectUrl but there is an error message, display it
            message.textContent = data.error || 'An unknown error occurred';
        }
    })
    .catch(error => {
        message.textContent = 'Failed to login';
    });
}

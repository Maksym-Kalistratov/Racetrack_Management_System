import { validateRace, validateUser } from '/common/validation.js';

let currentUser = null;

const appContainer = document.getElementById('app-container');
const errorBox = document.getElementById('connection-error');

const btnResults = document.getElementById('btn-results');
const btnDrivers = document.getElementById('btn-drivers');
const btnRaces = document.getElementById('btn-races');

const navGuest = document.getElementById('nav-guest');
const navUser = document.getElementById('nav-user');
const userDisplay = document.getElementById('user-display');
const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogout = document.getElementById('btn-logout');


document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    renderResults();
});

btnResults.addEventListener('click', renderResults);
btnDrivers.addEventListener('click', renderDrivers);
btnRaces.addEventListener('click', renderRaces);

btnLogin.addEventListener('click', renderLoginForm);
btnRegister.addEventListener('click', renderRegisterForm);
btnLogout.addEventListener('click', handleLogout);


// Renderer

function loadTemplate(templateId) {
    appContainer.innerHTML = '';

    const template = document.getElementById(templateId);

    const clone = template.content.cloneNode(true);
    appContainer.appendChild(clone);
}

function renderResults() {
    displayError('');
    loadTemplate('tmpl-results');

    const tbody = document.getElementById('tbody-results');
    loadData('/api/results', tbody, renderResultsRow);
}

function renderDrivers() {
    displayError('');
    loadTemplate('tmpl-drivers');

    const tbody = document.getElementById('tbody-drivers');
    loadData('/api/drivers', tbody, renderDriversRow);
}

function renderRaces() {
    displayError('');
    loadTemplate('tmpl-races');

    const tbody = document.getElementById('tbody-races');
    loadData('/api/races', tbody, renderRacesRow);

    const btnOpenAdd = document.getElementById('btn-open-add-race');
    if (currentUser && currentUser.role === 'admin') {
        btnOpenAdd.style.display = 'inline-block';
        btnOpenAdd.addEventListener('click', renderAddRaceForm);
    } else {
        btnOpenAdd.style.display = 'none';
    }
}

function renderAddRaceForm() {
    displayError('');
    loadTemplate('tmpl-add-race');

    const form = document.getElementById('form-add-race');
    const btnCancel = document.getElementById('btn-cancel-add');

    btnCancel.addEventListener('click', renderRaces);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddRaceSubmit();
    });
}

async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.authenticated) {
            currentUser = data.user;
        } else {
            currentUser = null;
        }
    } catch (e) {
        console.error("Auth check failed", e);
        currentUser = null;
    }
    updateNavUI();
}

function updateNavUI() {
    if (currentUser) {
        navGuest.style.display = 'none';
        navUser.style.display = 'inline-block';
        userDisplay.textContent = `Hello, ${currentUser.username}`;
    } else {
        navGuest.style.display = 'inline-block';
        navUser.style.display = 'none';
        userDisplay.textContent = '';
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        currentUser = null;
        updateNavUI();
        alert('You have logged out.');
        renderResults();
    } catch (e) {
        console.error(e);
    }
}


function renderLoginForm() {
    displayError('');
    loadTemplate('tmpl-login');

    const form = document.getElementById('form-login');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleLoginSubmit();
    });
}

function renderRegisterForm() {
    displayError('');
    loadTemplate('tmpl-register');

    const form = document.getElementById('form-register');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRegisterSubmit();
    });
}


// Forms

async function handleAddRaceSubmit() {
    const trackVal = document.getElementById('input-track').value;
    const dateVal = document.getElementById('input-date').value;
    const distVal = document.getElementById('input-distance').value;
    const weatherVal = document.getElementById('input-weather').value;

    const errors = validateRace(trackVal, dateVal, distVal, weatherVal);

    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    const newRace = {
        track_name: trackVal,
        race_date: dateVal,
        distance_km: distVal,
        weather_forecast: weatherVal
    };

    try {
        const response = await fetch('/api/races', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(newRace)
        });

        const result = await response.json();
        if (response.ok) {
            alert('Race added successfully!');
            renderRaces();
        } else {
            const msg = result.error || 'Failed to add race';
            const formattedMsg = msg.replace(/\n/g, '<br>');

            displayError(formattedMsg);
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error');
    }
}

async function handleRegisterSubmit() {
    const username = document.getElementById('reg-user').value;
    const password = document.getElementById('reg-pass').value;

    const errors = validateUser(username, password);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            renderLoginForm();
        } else {
            displayError(data.error);
        }
    } catch (e) {
        displayError("Registration network error");
    }
}

async function handleLoginSubmit() {

    const username = document.getElementById('auth-user').value;
    const password = document.getElementById('auth-pass').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (res.ok) {
            currentUser = data.user;
            updateNavUI();
            renderRaces();
        } else {
            displayError(data.error);
        }
    } catch (e) {
        displayError("Login network error");
    }
}

// Helpers

async function loadData(url, tbodyElement, renderRowCallback) {
    if (!tbodyElement) return;

    tbodyElement.innerHTML = '<tr><td colspan="5">Loading data...</td></tr>';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const data = await response.json();
        tbodyElement.innerHTML = '';

        if (data.length === 0) {
            tbodyElement.innerHTML = '<tr><td colspan="5">No records found</td></tr>';
            return;
        }

        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = renderRowCallback(row);
            tbodyElement.appendChild(tr);
        });

    } catch (error) {
        console.error('Network Error:', error);
        tbodyElement.innerHTML = '';
        displayError('Error: Could not connect to the server.');
    }
}

function displayError(message) {
    if (message) {
        errorBox.innerHTML = message;
        errorBox.classList.remove('hidden');
        errorBox.style.display = 'block';
    } else {
        errorBox.style.display = 'none';
    }
}

function renderResultsRow(row) {
    return `
        <td>${row.race_date}</td>
        <td><strong>${row.track_name}</strong></td>
        <td>${row.full_name}</td>
        <td>${row.car_model}</td>
        <td>${row.finish_position ? '#' + row.finish_position : 'DNF'}</td>
    `;
}

function renderDriversRow(row) {
    const statusColor = row.is_active ? 'green' : 'red';
    const statusText = row.is_active ? 'Active' : 'Retired';
    return `
        <td>${row.id}</td>
        <td><strong>${row.full_name}</strong></td>
        <td>${row.nationality}</td>
        <td>${row.license_number}</td>
        <td style="color:${statusColor}">${statusText}</td>
    `;
}

function renderRacesRow(row) {
    return `
        <td><strong>${row.track_name}</strong></td>
        <td>${row.race_date}</td>
        <td>${row.distance_km} km</td>
        <td>${row.weather_forecast || '-'}</td>
    `;
}
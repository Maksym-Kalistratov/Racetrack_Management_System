import {validateRace, validateUser} from '/common/validation.js';

let currentUser = null;

const appContainer = document.getElementById('app-container');
const errorBox = document.getElementById('connection-error');

const btnResults = document.getElementById('btn-results');
const btnDrivers = document.getElementById('btn-drivers');
const btnRaces = document.getElementById('btn-races');

const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogout = document.getElementById('btn-logout');


document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await renderResults();
});

btnResults.addEventListener('click', renderResults);
btnDrivers.addEventListener('click', renderDrivers);
btnRaces.addEventListener('click', renderRaces);

btnLogin.addEventListener('click', () => renderAuthForm('login'));
btnRegister.addEventListener('click', () => renderAuthForm('register'));
btnLogout.addEventListener('click', handleLogout);


// Renderer

function loadTemplate(templateId) {
    appContainer.innerHTML = '';

    const template = document.getElementById(templateId);

    const clone = template.content.cloneNode(true);
    appContainer.appendChild(clone);
}

async function renderResults() {
    displayError('');
    loadTemplate('tmpl-results');

    const tbody = document.getElementById('tbody-results');
    await loadData('/api/results', tbody, renderResultsRow);
}

async function renderDrivers() {
    displayError('');
    loadTemplate('tmpl-drivers');

    const tbody = document.getElementById('tbody-drivers');
    await loadData('/api/drivers', tbody, renderDriversRow);
}

async function renderRaces() {
    displayError('');
    loadTemplate('tmpl-races');

    const tbody = document.getElementById('tbody-races');
    await loadData('/api/races', tbody, renderRacesRow);

    const btnAdd = document.getElementById('btn-open-add-race');

    if (currentUser && currentUser.role === 'admin') {
        btnAdd.style.display = 'inline-block';
        btnAdd.addEventListener('click', () => renderRaceForm());

        tbody.addEventListener('click', async (e) => {

            // 1. Если кликнули на кнопку Удаления (или её иконку)
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                await handleDelete(id);
            }

            // 2. Если кликнули на кнопку Редактирования
            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const raceData = {
                    id: editBtn.dataset.id,
                    track_name: editBtn.dataset.track,
                    race_date: editBtn.dataset.date,
                    distance_km: editBtn.dataset.dist,
                    weather_forecast: editBtn.dataset.weather
                };
                renderRaceForm(raceData); // Открываем форму с этими данными
            }
        });

    } else {
        btnAdd.style.display = 'none';
    }
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
    const container = document.getElementById('nav-auth-container');
    container.innerHTML = '';

    if (currentUser) {
        const template = document.getElementById('tmpl-nav-user');
        const clone = template.content.cloneNode(true);

        const userDisplay = clone.getElementById('user-display');
        userDisplay.textContent = `Hello, ${currentUser.username}`;

        const btnLogout = clone.getElementById('btn-logout');
        btnLogout.addEventListener('click', handleLogout);

        container.appendChild(clone);

    } else {
        const template = document.getElementById('tmpl-nav-guest');
        const clone = template.content.cloneNode(true);

        const btnLogin = clone.getElementById('btn-login');
        const btnRegister = clone.getElementById('btn-register');

        btnLogin.addEventListener('click', () => renderAuthForm('login'));
        btnRegister.addEventListener('click', () => renderAuthForm('register'));

        container.appendChild(clone);
    }
}

async function handleLogout() {
    try {
        await fetch('/api/auth/logout', {method: 'POST'});
        currentUser = null;
        updateNavUI();
        alert('You have logged out.');
        await renderResults();
    } catch (e) {
        console.error(e);
    }
}

async function renderAuthForm(mode) {
    displayError('');
    loadTemplate('tmpl-auth');

    const title = document.getElementById('auth-title');
    const btn = document.getElementById('btn-auth-submit');
    const form = document.getElementById('form-auth');

    if (mode === 'login') {
        title.textContent = 'Login';
        btn.textContent = 'Sign In';
    } else {
        title.textContent = 'Register New User';
        btn.textContent = 'Create Account';
    }


    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (mode === 'login') {
            await handleLoginSubmit();
        } else {
            await handleRegisterSubmit();
        }
    });
}

function renderRaceForm(raceData = null) {
    displayError('');
    loadTemplate('tmpl-add-race');

    const title = document.getElementById('race-form-title');
    const btnSubmit = document.getElementById('btn-race-submit');
    const form = document.getElementById('form-add-race');
    const btnCancel = document.getElementById('btn-cancel-add');

    const inputTrack = document.getElementById('input-track');
    const inputDate = document.getElementById('input-date');
    const inputDistance = document.getElementById('input-distance');
    const inputWeather = document.getElementById('input-weather');

    if (raceData) {
        title.textContent = `Edit Race #${raceData.id}`;
        btnSubmit.textContent = 'Update Race';

        inputTrack.value = raceData.track_name;
        inputDate.value = raceData.race_date;
        inputDistance.value = raceData.distance_km;
        inputWeather.value = raceData.weather_forecast;
    } else {
        title.textContent = 'Add New Race';
        btnSubmit.textContent = 'Create Race';
    }

    btnCancel.addEventListener('click', renderRaces);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleRaceFormSubmit(raceData ? raceData.id : null);
    });
}

// Forms

async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this race permanently?")) {
        return;
    }

    try {
        const response = await fetch(`/api/races/${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            await renderRaces();
        } else {
            displayError(result.error || 'Failed to delete race');
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error during deletion');
    }
}

async function handleRaceFormSubmit(id = null) {
    const trackVal = document.getElementById('input-track').value;
    const dateVal = document.getElementById('input-date').value;
    const distVal = document.getElementById('input-distance').value;
    const weatherVal = document.getElementById('input-weather').value;

    const errors = validateRace(trackVal, dateVal, distVal, weatherVal);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    const racePayload = {
        track_name: trackVal,
        race_date: dateVal,
        distance_km: distVal,
        weather_forecast: weatherVal
    };

    try {
        let response;
        if (id) {
            response = await fetch(`/api/races/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(racePayload)
            });
        } else {
            response = await fetch('/api/races', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(racePayload)
            });
        }

        const result = await response.json();

        if (response.ok) {
            alert(id ? 'Race updated successfully!' : 'Race created successfully!');
            await renderRaces();
        } else {
            displayError(result.error || 'Operation failed');
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error');
    }
}

async function handleRegisterSubmit() {
    const username = document.getElementById('input-auth-user').value;
    const password = document.getElementById('input-auth-pass').value;

    const errors = validateUser(username, password);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            await renderAuthForm('login');
        } else {
            displayError(data.error);
        }
    } catch (e) {
        displayError("Registration network error");
    }
}

async function handleLoginSubmit() {

    const username = document.getElementById('input-auth-user').value;
    const password = document.getElementById('input-auth-pass').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();

        if (res.ok) {
            currentUser = data.user;
            updateNavUI();
            await renderRaces();
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
        errorBox.classList.remove('d-none');
    } else {
        errorBox.innerHTML = '';
        errorBox.classList.add('d-none');
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
    let html = `
        <td><strong>${row.track_name}</strong></td>
        <td>${row.race_date}</td>
        <td>${row.distance_km} km</td>
        <td>${row.weather_forecast || '-'}</td>
    `;
    if (currentUser && currentUser.role === 'admin') {
        html += `
            <td>
                <button class="btn btn-sm btn-warning me-1 btn-edit" 
                    data-id="${row.id}"
                    data-track="${row.track_name}"
                    data-date="${row.race_date}"
                    data-dist="${row.distance_km}"
                    data-weather="${row.weather_forecast || ''}">
                    ✏️
                </button>
                
                <button class="btn btn-sm btn-danger btn-delete" 
                    data-id="${row.id}">
                    🗑️
                </button>
            </td>
        `;
    } else {
        html += `<td>-</td>`;
    }

    return html;
}
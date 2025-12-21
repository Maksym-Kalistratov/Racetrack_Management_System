import {validateRace} from '/common/validation.js';

const appContainer = document.getElementById('app-container');
const errorBox = document.getElementById('connection-error');

const btnResults = document.getElementById('btn-results');
const btnDrivers = document.getElementById('btn-drivers');
const btnRaces = document.getElementById('btn-races');


document.addEventListener('DOMContentLoaded', () => {
    renderResults();
});

btnResults.addEventListener('click', renderResults);
btnDrivers.addEventListener('click', renderDrivers);
btnRaces.addEventListener('click', renderRaces);


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
    btnOpenAdd.addEventListener('click', renderAddRaceForm);
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
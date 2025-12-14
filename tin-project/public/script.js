const errorBox = document.getElementById('connection-error');

const btnResults = document.getElementById('btn-results');
const btnDrivers = document.getElementById('btn-drivers');
const btnRaces = document.getElementById('btn-races');

const viewResults = document.getElementById('view-results');
const viewDrivers = document.getElementById('view-drivers');
const viewRaces = document.getElementById('view-races');

const tbodyResults = document.getElementById('tbody-results');
const tbodyDrivers = document.getElementById('tbody-drivers');
const tbodyRaces = document.getElementById('tbody-races');

// Event Listeners

document.addEventListener('DOMContentLoaded', () => {
    loadData('/api/results', tbodyResults, renderResultsRow);
});

btnResults.addEventListener('click', () => {
    switchView(viewResults);
    loadData('/api/results', tbodyResults, renderResultsRow);
});

btnDrivers.addEventListener('click', () => {
    switchView(viewDrivers);
    loadData('/api/drivers', tbodyDrivers, renderDriversRow);
});

btnRaces.addEventListener('click', () => {
    switchView(viewRaces);
    loadData('/api/races', tbodyRaces, renderRacesRow);
});


// Logic Functions

function switchView(targetView) {
    viewResults.style.display = 'none';
    viewDrivers.style.display = 'none';
    viewRaces.style.display = 'none';

    targetView.style.display = 'block';
}

async function loadData(url, tbodyElement, renderRowCallback) {
    displayError('');
    tbodyElement.innerHTML = '<tr><td colspan="5">Loading data...</td></tr>';

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

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
        errorBox.innerText = message;
        errorBox.style.display = 'block';
    } else {
        errorBox.style.display = 'none';
    }
}

// Render

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
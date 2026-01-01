import {validateRace} from '/common/validation.js';
import {loadTemplate, displayError, loadData, currentUser} from './core.js';

export async function renderRaces() {
    displayError('');
    loadTemplate('tmpl-races');

    const tbody = document.getElementById('tbody-races');
    await loadData('/api/races', tbody, renderRacesRow);

    const btnAdd = document.getElementById('btn-open-add-race');

    if (currentUser && currentUser.role === 'admin') {
        btnAdd.style.display = 'inline-block';
        btnAdd.addEventListener('click', () => renderRaceForm());

        tbody.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                await handleDelete(id);
            }

            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const raceData = {
                    id: editBtn.dataset.id,
                    track_name: editBtn.dataset.track,
                    race_date: editBtn.dataset.date,
                    distance_km: editBtn.dataset.dist,
                    weather_forecast: editBtn.dataset.weather
                };
                renderRaceForm(raceData);
            }
        });
    } else {
        btnAdd.style.display = 'none';
    }
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

async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this race permanently?")) {
        return;
    }
    try {
        const response = await fetch(`/api/races/${id}`, {method: 'DELETE'});
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
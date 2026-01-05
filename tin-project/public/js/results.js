import { validateResult } from '/common/validation.js';
import { loadTemplate, displayError, loadData, currentUser } from './core.js';

export async function renderResults() {
    displayError('');
    loadTemplate('tmpl-results');
    const tbody = document.getElementById('tbody-results');
    await loadData('/api/results', tbody, renderResultsRow);

    const btnAdd = document.getElementById('btn-open-add-result');

    if (currentUser && currentUser.role === 'admin') {
        btnAdd.style.display = 'inline-block';
        btnAdd.addEventListener('click', () => renderResultForm());

        tbody.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const raceId = deleteBtn.dataset.raceId;
                const driverId = deleteBtn.dataset.driverId;
                await handleDelete(raceId, driverId);
            }

            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const resultData = {
                    race_id: editBtn.dataset.raceId,
                    driver_id: editBtn.dataset.driverId,
                    finish_position: editBtn.dataset.pos,
                    car_model: editBtn.dataset.car
                };
                await renderResultForm(resultData);
            }
        });
    } else {
        if (btnAdd) btnAdd.style.display = 'none';
    }
}

function renderResultsRow(row) {
    let html = `
        <td>${row.race_date}</td>
        <td><strong>${row.track_name}</strong></td>
        <td>${row.full_name}</td>
        <td>${row.car_model}</td>
        <td>${row.finish_position ? '#' + row.finish_position : 'DNF'}</td>
    `;

    if (currentUser && currentUser.role === 'admin') {
        html += `
            <td>
                <button class='btn btn-warning me-1 btn-edit' 
                    data-race-id='${row.race_id}' 
                    data-driver-id='${row.driver_id}'
                    data-pos='${row.finish_position}'
                    data-car='${row.car_model}'>
                    ✏️
                </button>
                <button class='btn btn-danger btn-delete' 
                    data-race-id='${row.race_id}' 
                    data-driver-id='${row.driver_id}'>
                    🗑️
                </button>
            </td>
        `;
    } else {
        html += '<td>-</td>';
    }
    return html;
}

async function renderResultForm(data = null) {
    displayError('');
    loadTemplate('tmpl-add-result');

    const title = document.getElementById('result-form-title');
    const btnSubmit = document.getElementById('btn-result-submit');
    const form = document.getElementById('form-add-result');
    const btnCancel = document.getElementById('btn-cancel-result');

    const selectRace = document.getElementById('select-result-race');
    const selectDriver = document.getElementById('select-result-driver');
    const inputPos = document.getElementById('input-result-pos');
    const inputCar = document.getElementById('input-result-car');

    await loadSelectOptions('/api/races/all', selectRace, 'id', 'track_name', data ? data.race_id : null);
    await loadSelectOptions('/api/drivers/all', selectDriver, 'id', 'full_name', data ? data.driver_id : null);

    if (data) {
        title.textContent = 'Edit Result';
        btnSubmit.textContent = 'Update Result';

        inputPos.value = data.finish_position;
        inputCar.value = data.car_model;

        selectRace.disabled = true;
        selectDriver.disabled = true;
    } else {
        title.textContent = 'Add New Result';
        btnSubmit.textContent = 'Save Result';
    }

    btnCancel.addEventListener('click', renderResults);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleResultFormSubmit(data);
    });
}

async function loadSelectOptions(url, selectElement, valueKey, textKey, selectedValue) {
    try {
        const res = await fetch(url);
        const data = await res.json();

        selectElement.innerHTML = '<option value="">-- Select --</option>';

        data.forEach(item => {
            const option = document.createElement('option');
            option.value = item[valueKey];

            let textLabel = item[textKey];

            if (item.race_date) {
                textLabel += ` (${item.race_date})`;
            }

            option.textContent = textLabel;

            if (selectedValue && String(item[valueKey]) === String(selectedValue)) {
                option.selected = true;
            }

            selectElement.appendChild(option);
        });
    } catch (e) {
        console.error('Error loading options', e);
        selectElement.innerHTML = '<option>Error loading data</option>';
    }
}

async function handleResultFormSubmit(originalData = null) {
    const raceId = document.getElementById('select-result-race').value;
    const driverId = document.getElementById('select-result-driver').value;
    const posVal = document.getElementById('input-result-pos').value;
    const carVal = document.getElementById('input-result-car').value;

    const errors = validateResult(raceId, driverId, posVal, carVal);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    const payload = {
        race_id: raceId,
        driver_id: driverId,
        finish_position: posVal === '' ? null : Number(posVal),
        car_model: carVal
    };

    try {
        let response;
        if (originalData) {
            const url = `/api/results/${originalData.race_id}/${originalData.driver_id}`;
            response = await fetch(url, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch('/api/results', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (response.ok) {
            alert(originalData ? 'Result updated!' : 'Result added!');
            await renderResults();
        } else {
            displayError(result.error || 'Operation failed');
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error');
    }
}

async function handleDelete(raceId, driverId) {
    if (!confirm('Delete this result record?')) return;

    try {
        const response = await fetch(`/api/results/${raceId}/${driverId}`, {method: 'DELETE'});
        const result = await response.json();

        if (response.ok) {
            await renderResults();
        } else {
            displayError(result.error || 'Failed to delete');
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error during deletion');
    }
}
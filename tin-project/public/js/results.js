import {loadTemplate, displayError, loadData} from './core.js';

export async function renderResults() {
    displayError('');
    loadTemplate('tmpl-results');
    const tbody = document.getElementById('tbody-results');
    await loadData('/api/results', tbody, renderResultsRow);
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
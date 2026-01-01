import {loadTemplate, displayError, loadData} from './core.js';

export async function renderDrivers() {
    displayError('');
    loadTemplate('tmpl-drivers');
    const tbody = document.getElementById('tbody-drivers');
    await loadData('/api/drivers', tbody, renderDriversRow);
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
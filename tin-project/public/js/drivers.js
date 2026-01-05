import {validateDriver} from '/common/validation.js';
import {loadTemplate, displayError, loadData, currentUser} from './core.js';

let currentPage = 1;

export async function renderDrivers(page = null) {
    if (page) currentPage = page;

    displayError('');
    loadTemplate('tmpl-drivers');
    const tbody = document.getElementById('tbody-drivers');
    const paginationCotrols = document.getElementById('drivers-pagination');

    await loadData(
        '/api/drivers',
        tbody,
        renderDriversRow,
        paginationCotrols,
        currentPage,
        renderDrivers
    );

    const btnAdd = document.getElementById('btn-open-add-driver');

    if (currentUser && currentUser.role === 'admin') {
        btnAdd.style.display = 'inline-block';
        btnAdd.addEventListener('click', () => renderDriverForm());

        tbody.addEventListener('click', async (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;
                await handleDelete(id);
            }

            const editBtn = e.target.closest('.btn-edit');
            if (editBtn) {
                const driverData = {
                    id: editBtn.dataset.id,
                    full_name: editBtn.dataset.name,
                    nationality: editBtn.dataset.nation,
                    license_number: editBtn.dataset.license,
                    is_active: editBtn.dataset.active
                };
                renderDriverForm(driverData);
            }
        });
    } else {
        if (btnAdd) btnAdd.style.display = 'none';
    }
}

function renderDriversRow(row) {
    const statusColor = row.is_active ? 'green' : 'red';
    const statusText = row.is_active ? 'Active' : 'Retired';

    let html = `
        <td>${row.id}</td>
        <td><strong>${row.full_name}</strong></td>
        <td>${row.nationality}</td>
        <td>${row.license_number}</td>
        <td style='color:${statusColor}'>${statusText}</td>
    `;

    if (currentUser && currentUser.role === 'admin') {
        html += `
            <td>
                <button class='btn btn-warning me-1 btn-edit' 
                    data-id='${row.id}'
                    data-name='${row.full_name}'
                    data-nation='${row.nationality}'
                    data-license='${row.license_number}'
                    data-active='${row.is_active ? '1' : '0'}'>
                    ✏️
                </button>
                <button class='btn btn-danger btn-delete' 
                    data-id='${row.id}'>
                    🗑️
                </button>
            </td>
        `;
    } else {
        html += '<td>-</td>';
    }

    return html;
}

function renderDriverForm(driverData = null) {
    displayError('');
    loadTemplate('tmpl-add-driver');

    const title = document.getElementById('driver-form-title');
    const btnSubmit = document.getElementById('btn-driver-submit');
    const form = document.getElementById('form-add-driver');
    const btnCancel = document.getElementById('btn-cancel-driver');

    const inputName = document.getElementById('input-driver-name');
    const inputNation = document.getElementById('input-driver-nation');
    const inputLicense = document.getElementById('input-driver-license');
    const inputActive = document.getElementById('input-driver-active');

    if (driverData) {
        title.textContent = `Edit Driver #${driverData.id}`;
        btnSubmit.textContent = 'Update Driver';

        inputName.value = driverData.full_name;
        inputNation.value = driverData.nationality;
        inputLicense.value = driverData.license_number;
        inputActive.value = driverData.is_active;
    } else {
        title.textContent = 'Add New Driver';
        btnSubmit.textContent = 'Create Driver';
        inputActive.value = '1';
    }

    btnCancel.addEventListener('click', () => renderDrivers());

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleDriverFormSubmit(driverData ? driverData.id : null);
    });
}

async function handleDriverFormSubmit(id = null) {
    const nameVal = document.getElementById('input-driver-name').value;
    const nationVal = document.getElementById('input-driver-nation').value;
    const licenseVal = document.getElementById('input-driver-license').value;
    const activeVal = document.getElementById('input-driver-active').value;

    const errors = validateDriver(nameVal, nationVal, licenseVal, activeVal);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    const payload = {
        full_name: nameVal,
        nationality: nationVal,
        license_number: licenseVal,
        is_active: activeVal === '1'
    };

    try {
        let response;
        if (id) {
            response = await fetch(`/api/drivers/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
        } else {
            response = await fetch('/api/drivers', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(payload)
            });
        }

        const result = await response.json();

        if (response.ok) {
            alert(id ? 'Driver updated successfully!' : 'Driver created successfully!');
            await renderDrivers();
        } else {
            displayError(result.error || 'Operation failed');
        }
    } catch (error) {
        console.error(error);
        displayError('Network Error');
    }
}

async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this driver?')) {
        return;
    }
    try {
        const response = await fetch(`/api/drivers/${id}`, {method: 'DELETE'});
        const result = await response.json();

        if (response.ok) {
            await renderDrivers();
        } else {
            displayError(result.error || 'Failed to delete driver');
        }
    } catch (error) {
        console.error(error);
        displayError('Error during deletion');
    }
}
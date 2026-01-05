// State
export let currentUser = null;

const pageSize = 5;

export function setCurrentUser(user) {
    currentUser = user;
    updateMainMenuVisibility();
}

// UI helpers
export const appContainer = document.getElementById('app-container');
const errorBox = document.getElementById('error');

export function displayError(message) {
    if (message) {
        errorBox.innerHTML = message;
        errorBox.classList.remove('d-none');
    } else {
        errorBox.innerHTML = '';
        errorBox.classList.add('d-none');
    }
}

export function loadTemplate(templateId) {
    appContainer.innerHTML = '';
    const template = document.getElementById(templateId);
    if (!template) {
        console.error(`Template ${templateId} not found`);
        return;
    }
    const clone = template.content.cloneNode(true);
    appContainer.appendChild(clone);
}

function updateMainMenuVisibility() {
    const btnDrivers = document.getElementById('btn-drivers');
    const btnRaces = document.getElementById('btn-races');

    if (currentUser) {
        if (btnDrivers) btnDrivers.style.display = 'inline-block';
        if (btnRaces) btnRaces.style.display = 'inline-block';
    } else {
        if (btnDrivers) btnDrivers.style.display = 'none';
        if (btnRaces) btnRaces.style.display = 'none';
    }
}

export async function loadData(url, tbodyElement, renderRowCallback, paginationControls, page = 1, onPageChange = null) {
    tbodyElement.innerHTML = '<tr><td colspan="100%" class="text-center">Loading...</td></tr>';

    try {
        let fetchUrl = `${url}?page=${page}&limit=${pageSize}`;

        const response = await fetch(fetchUrl);

        if (response.status === 401) {
            tbodyElement.innerHTML = '<tr><td colspan="100%" class="text-danger text-center">🔒 Login required</td></tr>';
            paginationControls.style.display = 'none';
            return;
        }

        if (!response.ok) throw new Error(`Server Error: ${response.status}`);

        const responseData = await response.json();

        const rows = responseData.data || [];
        const meta = responseData.pagination;

        tbodyElement.innerHTML = '';

        if (rows.length === 0) {
            tbodyElement.innerHTML = '<tr><td colspan="100%" class="text-center">No records found</td></tr>';
            paginationControls.style.display = 'none';
            return;
        }

        rows.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = renderRowCallback(row);
            tbodyElement.appendChild(tr);
        });

        paginationControls.style.display = 'flex';
        updatePaginationButtons(paginationControls, meta, onPageChange);


    } catch (error) {
        console.error('Network Error:', error);
        tbodyElement.innerHTML = '';
        displayError('Error: Could not connect to the server.');
    }
}

function updatePaginationButtons(container, meta, onPageChange) {
    const btnPrev = container.querySelector('.page-prev');
    const btnNext = container.querySelector('.page-next');
    const infoSpan = container.querySelector('.page-info');

    infoSpan.textContent = `Page ${meta.current_page} of ${meta.total_pages}`;

    const isFirst = meta.current_page <= 1;
    if (isFirst) {
        btnPrev.parentElement.classList.add('disabled');
        btnPrev.onclick = null;
    } else {
        btnPrev.parentElement.classList.remove('disabled');
        btnPrev.onclick = (e) => {
            e.preventDefault();
            onPageChange(meta.current_page - 1);
        }
    }

    const isLast = meta.current_page >= meta.total_pages;
    if (isLast) {
        btnNext.parentElement.classList.add('disabled');
        btnNext.onclick = null;
    } else {
        btnNext.parentElement.classList.remove('disabled');
        btnNext.onclick = (e) => {
            e.preventDefault();
            onPageChange(meta.current_page + 1);
        }
    }
}
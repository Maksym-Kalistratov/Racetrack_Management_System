// --- STATE ---
export let currentUser = null;

export function setCurrentUser(user) {
    currentUser = user;
}

// --- UI HELPERS ---
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

export async function loadData(url, tbodyElement, renderRowCallback) {
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
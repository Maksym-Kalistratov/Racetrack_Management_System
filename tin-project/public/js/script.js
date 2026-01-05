import {checkAuth} from './auth.js';
import {renderResults} from './results.js';
import {renderDrivers} from './drivers.js';
import {renderRaces} from './races.js';

const templateFiles = [
    '/templates/auth.html',
    '/templates/races.html',
    '/templates/results.html',
    '/templates/drivers.html'
];

document.addEventListener('DOMContentLoaded', async () => {
    await loadTemplates();

    const btnResults = document.getElementById('btn-results');
    const btnDrivers = document.getElementById('btn-drivers');
    const btnRaces = document.getElementById('btn-races');

    if (btnResults) btnResults.addEventListener('click', () => renderResults());
    if (btnDrivers) btnDrivers.addEventListener('click', () => renderDrivers());
    if (btnRaces) btnRaces.addEventListener('click', () => renderRaces());

    await checkAuth();
    await renderResults();
});

async function loadTemplates() {
    for (const url of templateFiles) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const html = await response.text();
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;

            const templates = tempDiv.querySelectorAll('template');
            templates.forEach(tmpl => {
                document.body.appendChild(tmpl);
            });
        } catch (e) {
            console.error(`Error loading the template ${url}:`, e);
        }
    }
}
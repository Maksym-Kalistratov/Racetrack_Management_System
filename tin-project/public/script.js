const tableBody = document.getElementById('table-body');
const errorBox = document.getElementById('connection-error');

async function fetchRaceData() {
    try {
        const response = await fetch('/api/results');

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        errorBox.style.display = 'none';

        const data = await response.json();

        tableBody.innerHTML = '';

        data.forEach(row => {
            const tr = document.createElement('tr');

            tr.innerHTML = `
                <td>${row.race_date}</td>
                <td><strong>${row.track_name}</strong></td>
                <td>${row.full_name}</td>
                <td>${row.car_model}</td>
                <td>${row.finish_position ? '#' + row.finish_position : 'DNF'}</td>
            `;

            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error fetching updates:', error);

        errorBox.innerText = "Error: Server is unavailable. Retrying...";
        errorBox.style.display = 'block';
    }
}


setInterval(fetchRaceData, 30000);
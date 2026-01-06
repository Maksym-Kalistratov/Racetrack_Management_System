const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, './db/racetrack.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the SQLite database at ' + dbPath);
});

// Helpers

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({id: this.lastID, changes: this.changes});
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

// Drivers

function getAllDrivers() {
    return query('SELECT id, full_name FROM drivers ORDER BY full_name ASC');
}

function getPaginatedDrivers(limit, offset) {
    return query('SELECT * FROM drivers ORDER BY full_name ASC LIMIT ? OFFSET ?',
        [limit, offset]);
}

function getTotalDriversCount() {
    return get('SELECT COUNT(*) as count FROM drivers');
}

async function driverExistsById(id) {
    const result = await get('SELECT 1 FROM drivers WHERE id = ?',
        [id]);
    return !!result;
}

function createDriver(fullName, nationality, licenseNumber, isActive) {
    return run('INSERT INTO drivers (full_name, nationality, license_number, is_active) VALUES (?, ?, ?, ?)',
        [fullName, nationality, licenseNumber, isActive]);
}

function updateDriver(id, fullName, nationality, licenseNumber, isActive) {
    return run('UPDATE drivers SET full_name = ?, nationality = ?, license_number = ?, is_active = ? WHERE id = ?',
        [fullName, nationality, licenseNumber, isActive, id]);
}

function deleteDriver(id) {
    return run('DELETE FROM drivers WHERE id = ?',
        [id]);
}

// Results

function getPaginatedResults(limit, offset) {
    const sql = `
        SELECT
            rr.race_id,
            rr.driver_id,
            rr.finish_position,
            rr.car_model,
            r.track_name,
            r.race_date,
            d.full_name
        FROM race_results rr
        JOIN races r ON rr.race_id = r.id
        JOIN drivers d ON rr.driver_id = d.id
        ORDER BY r.race_date DESC, rr.finish_position ASC
        LIMIT ? OFFSET ?
    `
    return query(sql, [limit, offset]);
}

function getTotalResultsCount() {
    return get('SELECT COUNT(*) as count FROM race_results');
}

function createResult(raceId, driverId, finishPosition, carModel) {
    return run('INSERT INTO race_results (race_id, driver_id, finish_position, car_model) VALUES (?, ?, ?, ?)',
        [raceId, driverId, finishPosition, carModel]);
}

function deleteResult(raceId, driverId) {
    return run('DELETE FROM race_results WHERE race_id = ? AND driver_id = ?',
        [raceId, driverId]);
}

function updateResult(raceId, driverId, finishPosition, carModel) {
    return run('UPDATE race_results SET finish_position = ?, car_model = ? WHERE race_id = ? AND driver_id = ?',
        [finishPosition, carModel, raceId, driverId]);
}

async function resultExistsByRaceAndDriver(raceId, driverId) {
    const result = await get('SELECT 1 FROM race_results WHERE race_id = ? AND driver_id = ?',
        [raceId, driverId]);
    return !!result;
}

// Races

function getAllRaces() {
    return query('SELECT id, track_name, race_date FROM races ORDER BY race_date DESC');
}

function getPaginatedRaces(limit, offset) {
    return query('SELECT * FROM races ORDER BY race_date DESC LIMIT ? OFFSET ?',
        [limit, offset]);
}

function getTotalRacesCount() {
    return get('SELECT COUNT(*) as count FROM races');
}

async function raceExistsById(id) {
    const result = await get('SELECT 1 FROM races WHERE id = ?',
        [id])
    return !!result;
}

function createRace(trackName, raceDate, distance, weather) {
    return run('INSERT INTO races (track_name, race_date, distance_km, weather_forecast) VALUES (?, ?, ?, ?)',
        [trackName, raceDate, distance, weather]);
}

function updateRace(id, trackName, raceDate, distance, weather) {
    return run('UPDATE races SET track_name = ?, race_date = ?, distance_km = ?, weather_forecast = ? WHERE id = ?',
        [trackName, raceDate, distance, weather, id]);
}

function deleteRace(id) {
    return run('DELETE FROM races WHERE id = ?',
        [id]);
}

// Users & Auth

function getRoleByName(name) {
    return get('SELECT id FROM roles WHERE name = ?',
        [name]);
}

function createUser(username, passwordHash, roleId) {
    return run('INSERT INTO users (username, password_hash, role_id) VALUES (?, ?, ?)',
        [username, passwordHash, roleId]);
}

function findUserByUsername(username) {
    return get('SELECT u.*, r.name as role_name FROM users u LEFT JOIN roles r ON u.role_id = r.id WHERE u.username = ?',
        [username]);
}

// Sessions

async function getSession(sid) {
    const row = await get('SELECT sess FROM sessions WHERE sid = ?',
        [sid]);
    return row ? JSON.parse(row.sess) : null;
}

function saveSession(sid, sessData) {
    const sessString = JSON.stringify(sessData);
    return run('INSERT OR REPLACE INTO sessions (sid, sess) VALUES (?, ?)',
        [sid, sessString]);
}

function destroySession(sid) {
    return run('DELETE FROM sessions WHERE sid = ?',
        [sid]);
}

// System

function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'sql', 'db_schema.sql');
    const seedPath = path.join(__dirname, 'sql', 'sample_data.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    db.serialize(() => {
        console.log('Checking/Creating tables...');
        db.exec(schemaSql, (err) => {
            if (err) {
                console.error('Error creating tables:', err.message);
            } else {
                console.log('Tables initialized.');
            }
        });

        db.get('SELECT count(*) as count FROM drivers', (err, row) => {
            if (err) {
                console.error('Error checking data:', err.message);
                return;
            }

            if (row && row.count === 0) {
                console.log('Database is empty. Populating with sample data...');
                db.exec(seedSql, (err) => {
                    if (err) {
                        return console.error('Error inserting sample data:', err.message);
                    }
                    console.log('Sample data inserted');
                });
            } else {
                console.log('Database already contains data. Skipping generation.');
            }
        });
    });
}

function closeDatabase() {
    db.close((err) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Closed the database connection.');
    });
}

module.exports = {
    db,
    initializeDatabase,
    closeDatabase,

    getAllDrivers,
    getPaginatedDrivers,
    getTotalDriversCount,
    createDriver,
    updateDriver,
    deleteDriver,
    driverExistsById,

    getPaginatedResults,
    getTotalResultsCount,
    createResult,
    updateResult,
    deleteResult,
    resultExistsByRaceAndDriver,

    createUser,
    findUserByUsername,
    getSession,
    saveSession,
    destroySession,
    getRoleByName,

    getAllRaces,
    getPaginatedRaces,
    getTotalRacesCount,
    createRace,
    updateRace,
    raceExistsById,
    deleteRace
};
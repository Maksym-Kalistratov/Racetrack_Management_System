const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.resolve(__dirname, './db/racetrack.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error(err.message);
    }
    console.log(`Connected to the SQLite database at ${dbPath}`);
});

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

function getAllDrivers() {
    return query("SELECT * FROM drivers ORDER BY full_name ASC");
}

function getAllRaces() {
    return query("SELECT * FROM races ORDER BY race_date DESC");
}

function getAllResults() {
    const sql = `
        SELECT r.track_name,
               r.race_date,
               r.weather_forecast,
               d.full_name,
               rr.finish_position,
               rr.car_model
        FROM races r
                 JOIN race_results rr ON r.id = rr.race_id
                 JOIN drivers d ON d.id = rr.driver_id
        ORDER BY r.race_date DESC, rr.finish_position ASC
    `;
    return query(sql);
}

function createRace(trackName, raceDate, distance, weather) {
    const sql = `
        INSERT INTO races (track_name, race_date, distance_km, weather_forecast)
        VALUES (?, ?, ?, ?)
    `;
    return run(sql, [trackName, raceDate, distance, weather]);
}

function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'sql', 'db_schema.sql');
    const seedPath = path.join(__dirname, 'sql', 'sample_data.sql');

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    db.serialize(() => {

        console.log('Checking/Creating tables...');
        db.exec(schemaSql, (err) => {
            if (err) {
                console.error("Error creating tables:", err.message);
            } else {
                console.log("Tables initialized.");
            }
        });

        db.get("SELECT count(*) as count FROM drivers", (err, row) => {
            if (err) {
                console.error("Error checking data:", err.message);
                return;
            }

            if (row && row.count === 0) {
                console.log('Database is empty. Populating with sample data...');
                db.exec(seedSql, (err) => {
                    if (err) {
                        return console.error("Error inserting sample data:", err.message);
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

function createUser(username, passwordHash) {
    const sql = `INSERT INTO users (username, password_hash)
                 VALUES (?, ?)`;
    return run(sql, [username, passwordHash]);
}

function findUserByUsername(username) {
    return get(`SELECT *
                FROM users
                WHERE username = ?`, [username]);
}

async function getSession(sid) {
    const row = await get("SELECT sess FROM sessions WHERE sid = ?", [sid]);
    return row ? JSON.parse(row.sess) : null;
}

function saveSession(sid, sessData) {
    const sessString = JSON.stringify(sessData);
    const sql = `INSERT
    OR REPLACE INTO sessions (sid, sess) VALUES (?, ?)`;
    return run(sql, [sid, sessString]);
}

function destroySession(sid) {
    return run("DELETE FROM sessions WHERE sid = ?", [sid]);
}


module.exports = {
    db,
    initializeDatabase,
    closeDatabase,
    query,
    run,
    get,
    getAllDrivers,
    getAllRaces,
    getAllResults,
    createRace,
    createUser,
    findUserByUsername,
    getSession,
    saveSession,
    destroySession
};
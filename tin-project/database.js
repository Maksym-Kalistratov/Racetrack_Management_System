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

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
};

function initializeDatabase() {
    const schemaPath = path.join(__dirname, 'sql', 'db_schema.sql');
    const seedPath = path.join(__dirname, 'sql', 'samle_data.sql');

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

module.exports = {
    db,
    initializeDatabase,
    closeDatabase,
    query
};
Database Configuration

This project uses SQLite as its primary database. The connection settings are managed via environment variable, making it easy to switch databases or change paths without touching the code.

How to Update Connection Information:

The application defaults to ./db/racetrack.db if no configuration is provided. To use a different database file:

1. Create an .env file in the root directory of the project.

2. Add the DB_FILE variable with the relative path to your SQLite file.
Example .env configuration:
"DB_FILE=./db/production.db"


Switching to MySQL

To use MySQL instead of the default SQLite, follow these steps:

Install the MySQL driver:

"npm install mysql2"

Update the .env file: Add MySQL connection details.

DB_HOST=localhost
DB_USER=username
DB_PASS=password
DB_NAME=racetrack_db

Update database.js: Replace the SQLite connection logic with the MySQL connection logic.

Replace this (SQLite):
"
const sqlite3 = require('sqlite3').verbose();
const dbPath = path.resolve(__dirname, process.env.DB_FILE || './db/racetrack.db');

const db = new sqlite3.Database(dbPath, (err) => { ... });
"
With this (MySQL):

"
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) return console.error('Error connecting to MySQL:', err.message);
    console.log('Connected to the MySQL database.');
});
"

It is also required to slightly adapt the helper functions (query, run, get) to match the mysql2 API. Example:
SQLite:
"
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
}
"
MySQL:
"
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            else resolve({ id: result.insertId, changes: result.affectedRows });
        });
    });
}
"

The default sql/db_schema.sql is written for SQLite. For MySQL, it needs to be manually rewriten the SQL syntax:

1. Change INTEGER PRIMARY KEY AUTOINCREMENT to INT AUTO_INCREMENT PRIMARY KEY.
2. Change TEXT columns used for dates to DATE or DATETIME.
3. Change TEXT to VARCHAR(255) for short strings.
4. Change INTEGER (0/1) to TINYINT(1).


MondoDB:

Switching to MongoDB in this case will be difficult since it is designed for NoSQL, which will mean rewriting the entire logic of interaction with the database in the database.js file.

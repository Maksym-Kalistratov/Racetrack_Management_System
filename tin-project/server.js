const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const dbModule = require('./database');

dbModule.initializeDatabase();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
    res.send(`
        <h1>Racetrack Management System</h1>
        <p>Server is running successfully</p>
    `);
});

app.listen(port, () => {
    console.log(`Racetrack App running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    dbModule.closeDatabase();
    process.exit(0);
});
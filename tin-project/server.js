const express = require("express");
const path = require("path");
const app = express();
const port = 3000;

const dbModule = require('./database');

dbModule.initializeDatabase();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api", require("./routes/apiRouter"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

app.listen(port, () => {
    console.log(`Racetrack App running on http://localhost:${port}`);
});

process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    dbModule.closeDatabase();
    process.exit(0);
});
require('dotenv').config();

const express = require("express");
const path = require("path");
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MySqliteStore = require('./sessionStore');

const app = express();
const port = 3000;

const dbModule = require('./database');

app.use(cookieParser());

dbModule.initializeDatabase();

app.use(session({
    store: new MySqliteStore(),
    secret: process.env.SESSION_SECRET || 'default_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true
    }
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}));

app.use(express.static(path.join(__dirname, "public")));
app.use("/common", express.static(path.join(__dirname, "common")));
app.use('/bootstrap', express.static(path.join(__dirname, 'node_modules/bootstrap/dist/css')));

app.use("/api", require("./routes/apiRouter"));
app.use('/api/auth', require("./routes/authRouter"));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, "public", "html", "index.html"));
});

app.listen(port, () => {
    console.log(`Racetrack App running on http://localhost:${port}`);
});

app.use((err, req, res, next) => {
    console.error('SERVER ERROR:', err);

    const statusCode = err.status || 500;

    let message = 'Internal Server Error';

    if (statusCode !== 500) {
        message = err.message;
    }

    res.status(statusCode).json({ error: message });
});

process.on('SIGINT', () => {
    console.log('Server is shutting down...');
    dbModule.closeDatabase();
    process.exit(0);
});
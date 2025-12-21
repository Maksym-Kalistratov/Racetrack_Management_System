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
    secret: 'Hello_world!§',
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

app.use("/api", require("./routes/apiRouter"));
app.use('/api/auth', require("./routes/authRouter"));

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
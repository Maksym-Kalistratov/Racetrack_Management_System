const express = require('express');
const router = express.Router();
const dbModule = require('../database');

router.get('/drivers', async (req, res) => {
    try {
        const rows = await dbModule.getAllDrivers();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/races', async (req, res) => {
    try {
        const rows = await dbModule.getAllRaces();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/results', async (req, res) => {
    try {
        const rows = await dbModule.getAllResults();
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const dbModule = require('../database');
const validator = require("../common/validation");

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

router.post('/races', async (req, res) => {
    const { track_name, race_date, distance_km, weather_forecast } = req.body;

    const errors = validator.validateRace(track_name, race_date, distance_km, weather_forecast);

    if (errors.length > 0) {
        return res.status(400).json({ error: errors.join(', ') });
    }

    try {
        const result = await dbModule.createRace(track_name, race_date, distance_km, weather_forecast);

        res.json({
            success: true,
            id: result.id,
            message: "Race created successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error: " + err.message });
    }
});

module.exports = router;
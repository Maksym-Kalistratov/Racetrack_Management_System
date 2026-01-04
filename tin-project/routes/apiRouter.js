const express = require('express');
const router = express.Router();
const dbModule = require('../database');
const validator = require("../common/validation");
const {isAdmin} = require('../middleware/checkAuth');

// Drivers

router.get('/drivers', async (req, res) => {
    try {
        const rows = await dbModule.getAllDrivers();
        res.json(rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.post('/drivers', isAdmin, async (req, res) => {
    const {full_name, nationality, license_number, is_active} = req.body;

    const errors = validator.validateDriver(full_name, nationality, license_number, is_active);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const result = await dbModule.createDriver(full_name, nationality, license_number, is_active);

        res.json({
            success: true,
            id: result.id,
            message: "Driver created successfully"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error: " + err.message});
    }
});

router.put('/drivers/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    const {full_name, nationality, license_number, is_active} = req.body;

    const errors = validator.validateDriver(full_name, nationality, license_number, is_active);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const result = await dbModule.updateDriver(id, full_name, nationality, license_number, is_active);
        if (result.changes === 0) {
            return res.status(404).json({error: "Driver not found"});
        }

        res.json({success: true, message: "Driver updated"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

router.delete('/drivers/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await dbModule.deleteDriver(id);

        if (result.changes === 0) {
            return res.status(404).json({error: "Driver not found"});
        }

        res.json({success: true, message: "Driver deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

// Races

router.get('/races', async (req, res) => {
    try {
        const rows = await dbModule.getAllRaces();
        res.json(rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

router.post('/races', isAdmin, async (req, res) => {
    const {track_name, race_date, distance_km, weather_forecast} = req.body;

    const errors = validator.validateRace(track_name, race_date, distance_km, weather_forecast);

    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
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
        res.status(500).json({error: "Database error: " + err.message});
    }
});

router.put('/races/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    const {track_name, race_date, distance_km, weather_forecast} = req.body;

    const errors = validator.validateRace(track_name, race_date, distance_km, weather_forecast);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const result = await dbModule.updateRace(id, track_name, race_date, distance_km, weather_forecast);

        if (result.changes === 0) {
            return res.status(404).json({error: "Race not found"});
        }

        res.json({success: true, message: "Race updated"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

router.delete('/races/:id', isAdmin, async (req, res) => {
    const id = req.params.id;

    try {
        const result = await dbModule.deleteRace(id);

        if (result.changes === 0) {
            return res.status(404).json({error: "Race not found"});
        }

        res.json({success: true, message: "Race deleted"});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Database error"});
    }
});

// Results

router.get('/results', async (req, res) => {
    try {
        const rows = await dbModule.getAllResults();
        res.json(rows);
    } catch (err) {
        res.status(500).json({error: err.message});
    }
});

module.exports = router;
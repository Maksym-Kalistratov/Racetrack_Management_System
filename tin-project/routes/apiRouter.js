const express = require('express');
const router = express.Router();
const dbModule = require('../database');
const validator = require('../common/validation');
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
            message: 'Driver created successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

router.put('/drivers/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    const {full_name, nationality, license_number, is_active} = req.body;

    if (isNaN(id)) return res.status(400).json({error: "Invalid ID"});

    const errors = validator.validateDriver(full_name, nationality, license_number, is_active);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const result = await dbModule.updateDriver(id, full_name, nationality, license_number, is_active);
        if (result.changes === 0) {
            return res.status(404).json({error: 'Driver not found'});
        }

        res.json({success: true, message: 'Driver updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
    }
});

router.delete('/drivers/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    try {
        const result = await dbModule.deleteDriver(id);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Driver not found'});
        }

        res.json({success: true, message: 'Driver deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
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
            message: 'Race created successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

router.put('/races/:id', isAdmin, async (req, res) => {
    const id = req.params.id;
    const {track_name, race_date, distance_km, weather_forecast} = req.body;

    if (isNaN(id)) return res.status(400).json({error: "Invalid ID"});

    const errors = validator.validateRace(track_name, race_date, distance_km, weather_forecast);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const result = await dbModule.updateRace(id, track_name, race_date, distance_km, weather_forecast);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Race not found'});
        }

        res.json({success: true, message: 'Race updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
    }
});

router.delete('/races/:id', isAdmin, async (req, res) => {
    const id = req.params.id;

    try {
        const result = await dbModule.deleteRace(id);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Race not found'});
        }

        res.json({success: true, message: 'Race deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
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

router.post('/results', isAdmin, async (req, res) => {
    const {race_id, driver_id, finish_position, car_model} = req.body;
    
    const errors = validator.validateResult(race_id, driver_id, finish_position, car_model);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const valid = await validateForeignKeys(res, race_id, driver_id);
        if (!valid) return;
        
        const duplicate = await dbModule.resultExistsByRaceAndDriver(race_id, driver_id);
        if (duplicate) {
            return res.status(409).json({error: 'This driver already has a result in this race'});
        }
        
        const result = await dbModule.createResult(race_id, driver_id, finish_position, car_model);
        res.json({
            success: true,
            id: result.id,
            message: 'Result record created successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error: ' + err.message});
    }
});

router.put('/results/:race_id/:driver_id', isAdmin, async (req, res) => {
    const raceIdParam = Number(req.params.race_id);
    const driverIdParam = Number(req.params.driver_id);
    
    const { finish_position, car_model } = req.body;
    
    const errors = validator.validateResult(raceIdParam, driverIdParam, finish_position, car_model);
    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {

        const result = await dbModule.updateResult(raceIdParam, driverIdParam, finish_position, car_model);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Result record not found'});
        }

        res.json({success: true, message: 'Result updated'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
    }
});

router.delete('/results/:race_id/:driver_id', isAdmin, async (req, res) => {
    const raceId = Number(req.params.race_id);
    const driverId = Number(req.params.driver_id);
    
    if (!Number.isInteger(raceId) || !Number.isInteger(driverId)) {
        return res.status(400).json({error: 'Invalid IDs'});
    }

    try {
        const result = await dbModule.deleteResult(raceId, driverId);

        if (result.changes === 0) {
            return res.status(404).json({error: 'Result record not found'});
        }
        res.json({success: true, message: 'Result deleted'});
    } catch (err) {
        console.error(err);
        res.status(500).json({error: 'Database error'});
    }
});

async function validateForeignKeys(res, raceId, driverId) {
    const raceExists = await dbModule.raceExistsById(raceId);
    if (!raceExists) {
        res.status(400).json({error: 'Race with ID ' + raceId + ' not found'});
        return false;
    }

    const driverExists = await dbModule.driverExistsById(driverId);
    if (!driverExists) {
        res.status(400).json({error: 'Driver with ID ' + driverId + ' not found'});
        return false;
    }

    return true;
}
module.exports = router;
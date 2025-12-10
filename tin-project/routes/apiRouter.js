const express = require('express');
const router = express.Router();
const dbModule = require('../database');

router.get('/results', async (req, res) => {
    const sql = `
        SELECT 
            r.track_name, 
            r.race_date,
            r.weather_forecast,
            d.full_name, 
            rr.finish_position,
            rr.car_model
        FROM races r
        JOIN race_results rr ON r.id = rr.race_id
        JOIN drivers d ON d.id = rr.driver_id
        ORDER BY r.race_date DESC, rr.finish_position ASC
    `;

    try {
        const rows = await dbModule.query(sql);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
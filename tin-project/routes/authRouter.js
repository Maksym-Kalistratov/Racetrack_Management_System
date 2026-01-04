const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const dbModule = require('../database');

const {validateUser} = require('../common/validation');

router.post('/register', async (req, res) => {
    const {username, password} = req.body;

    const errors = validateUser(username, password);

    if (errors.length > 0) {
        return res.status(400).json({error: errors.join('<br>')});
    }

    try {
        const existingUser = await dbModule.findUserByUsername(username);
        if (existingUser) {
            return res.status(400).json({error: "Username already exists"});
        }

        const hash = await bcrypt.hash(password, 10);

        const role = await dbModule.getRoleByName('user');

        await dbModule.createUser(username, hash, role.id);

        res.json({success: true, message: "User created"});
    } catch (err) {
        res.status(500).json({error: "Server error"});
    }
});

router.post('/login', async (req, res) => {
    const {username, password} = req.body;

    try {
        const user = await dbModule.findUserByUsername(username);

        if (!user) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        const match = await bcrypt.compare(password, user.password_hash);

        if (!match) {
            return res.status(401).json({error: "Invalid credentials"});
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role_name
        };

        res.json({success: true, message: "Logged in", user: req.session.user});

    } catch (err) {
        console.error(err);
        res.status(500).json({error: "Server error"});
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({error: "Logout failed"});

        res.clearCookie('connect.sid');
        res.json({success: true});
    });
});

router.get('/me', (req, res) => {
    if (req.session.user) {
        res.json({authenticated: true, user: req.session.user});
    } else {
        res.json({authenticated: false});
    }
});

module.exports = router;
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized: You must be logged in' });
}

function isAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.session.user.role === 'admin') {
        return next();
    }

    res.status(403).json({ error: 'Access denied' });
}

module.exports = { isAuthenticated, isAdmin };
const session = require('express-session');
const dbModule = require('./database');

class MySqliteStore extends session.Store {
    constructor() {
        super();
    }

    get(sid, callback) {
        dbModule.getSession(sid)
            .then(session => callback(null, session))
            .catch(err => callback(err));
    }

    set(sid, sessionData, callback) {
        dbModule.saveSession(sid, sessionData)
            .then(() => callback(null))
            .catch(err => callback(err));
    }

    destroy(sid, callback) {
        dbModule.destroySession(sid)
            .then(() => callback(null))
            .catch(err => callback(err));
    }
}

module.exports = MySqliteStore;
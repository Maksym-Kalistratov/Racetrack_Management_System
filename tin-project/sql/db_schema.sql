PRAGMA
foreign_keys = ON;

-- 1. Drivers Table
CREATE TABLE IF NOT EXISTS drivers
(
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name      TEXT NOT NULL,
    nationality    TEXT NOT NULL,
    license_number TEXT NOT NULL UNIQUE,
    is_active      INTEGER DEFAULT 1
);

-- 2. Races Table
CREATE TABLE IF NOT EXISTS races
(
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    track_name       TEXT NOT NULL,
    race_date        TEXT NOT NULL,
    distance_km      REAL NOT NULL,
    weather_forecast TEXT
);

-- 3. Race Results (The Many-to-Many Connection)
CREATE TABLE IF NOT EXISTS race_results
(
    race_id         INTEGER,
    driver_id       INTEGER,
    finish_position INTEGER,
    car_model       TEXT NOT NULL,

    PRIMARY KEY (race_id, driver_id),

    FOREIGN KEY (race_id) REFERENCES races (id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES drivers (id) ON DELETE CASCADE
);
INSERT INTO drivers (full_name, nationality, license_number, is_active)
VALUES ('Max Verstappen', 'Netherlands', 'NL-3301', 1),
       ('Lewis H.', 'UK', 'UK-4402', 1),
       ('Charles L.', 'Monaco', 'MC-1603', 1),
       ('Old Stig', 'Unknown', 'XX-0000', 0);

INSERT INTO races (track_name, race_date, distance_km, weather_forecast)
VALUES ('Silverstone GP', '2025-07-07', 306.198, 'Cloudy'),
       ('Monaco GP', '2025-05-26', 260.286, 'Sunny'),
       ('Spa-Francorchamps', '2025-08-25', 308.052, 'Rain');

INSERT INTO race_results (race_id, driver_id, finish_position, car_model)
VALUES (1, 1, 1, 'Red Bull RB20'),
       (1, 2, 2, 'Mercedes W15'),
       (1, 3, 3, 'Ferrari SF-24');

INSERT INTO race_results (race_id, driver_id, finish_position, car_model)
VALUES (2, 3, 1, 'Ferrari SF-24'),
       (2, 1, 5, 'Red Bull RB20');

INSERT INTO race_results (race_id, driver_id, finish_position, car_model)
VALUES (3, 1, NULL, 'Red Bull RB20'),
       (3, 2, NULL, 'Mercedes W15');

INSERT INTO roles (name) VALUES ('admin'), ('user'), ('guest');

INSERT INTO users (username, password_hash, role_id) VALUES ('admin', '$2b$10$l.E7hrFw7XCk8xNVZwD4uOHrw.Cl284HJLX3wlXnqKp3BWmg7E0cy', 1)
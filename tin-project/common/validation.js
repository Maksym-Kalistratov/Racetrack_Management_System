export function validateRace(trackRaw, dateRaw, distanceRaw, weatherRaw) {
    const errors = [];

    const trackName = (trackRaw || "").toString().trim();
    const raceDate = (dateRaw || "").toString().trim();
    const distanceStr = (distanceRaw || "").toString().trim();

    if (!trackName || !raceDate || !distanceStr || !weatherRaw) {
        errors.push("Error: All fields (Track, Date, Distance, Weather) must be filled.");
        return errors;
    }

    if (trackName.length < 3) {
        errors.push("Error: Track name must be at least 3 characters long.");
    }

    const distance = Number(distanceStr);
    if (Number.isNaN(distance) || distance <= 0) {
        errors.push("Error: Distance must be a positive number.");
    }

    const dateObj = new Date(raceDate);
    if (isNaN(dateObj.getTime())) {
        errors.push("Error: Invalid date format.");
    }

    return errors;
}
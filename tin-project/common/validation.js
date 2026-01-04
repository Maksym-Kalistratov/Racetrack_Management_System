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

export function validateUser(usernameRaw, passwordRaw) {
    const errors = [];

    const username = (usernameRaw || "").toString().trim();
    const password = (passwordRaw || "").toString().trim();

    if (!username || !password) {
        errors.push("Error: Username and Password are required.");
        return errors;
    }

    if (username.length < 3) {
        errors.push("Error: Username must be at least 3 characters long.");
    }

    if (password.length < 6) {
        errors.push("Error: Password must be at least 6 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
        errors.push("Error: Password must contain at least one uppercase letter.");
    }
    if (!/[0-9]/.test(password)) {
        errors.push("Error: Password must contain at least one number.");
    }

    return errors;
}

export function validateDriver(fullNameRaw, nationalityRaw, licenseNumberRaw, isActiveRaw) {
    const errors = [];

    const fullName = (fullNameRaw || "").toString().trim();
    const nationality = (nationalityRaw || "").toString().trim();
    const licenseNumber = (licenseNumberRaw || "").toString().trim();
    const isActive = Number(isActiveRaw);

    if (!fullName || !nationality || !licenseNumber) {
        errors.push("Error: All fields (Full Name, Nationality, License Number) must be filled.");
        return errors;
    }

    if (fullName.length < 3) {
        errors.push("Error: Full name must be at least 3 characters long.");
    }

    if (nationality.length < 2) {
        errors.push("Error: Nationality must be at least 2 characters long.");
    }

    if (!/^[A-Z]{2}-\d{4}$/.test(licenseNumber)) {
        errors.push("Error: License number must be in format XX-0000.");
    }

    if (isActive !== 0 && isActive !== 1) {
        errors.push("Error: Is Active must be either 0 or 1.");
    }

    return errors;
}
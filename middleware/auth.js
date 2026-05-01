const fetchUser = async (req, res, next) => {

    const baseUrl = process.env.XANO_BASE_URL;

    if (!baseUrl) {
        console.error("CRITICAL ERROR: XANO_BASE_URL is not defined in .env");
        res.locals.user = null;
        return next();
    }
    
    // Check if a session exists and has an authToken
    if (!req.session || !req.session.authToken) {
        res.locals.user = null;
        return next();
    }

    try {
        const response = await fetch(`${baseUrl.replace(/\/$/, '')}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${req.session.authToken}`
            }
        });

        const userData = await response.json().catch(() => ({}));

        if (response.ok) {
            // Store user in res.locals for EJS and req.user for routes
            res.locals.user = userData;
            req.user = userData;
        } else {
            res.locals.user = null;
        }
    } catch (err) {
        console.error("Auth middleware error:", err);
        res.locals.user = null;
    }
    next();
};

module.exports = { fetchUser };
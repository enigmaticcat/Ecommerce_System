import jwt from 'jsonwebtoken';

/**
 * Optional auth middleware - doesn't require login but extracts userId if token present
 * Works with both GET and POST requests
 */
const optionalAuth = async (req, res, next) => {
    const { token } = req.headers;

    if (!token) {
        // No token, but that's OK - just proceed without userId
        req.userId = null;
        req.body.userId = null;
        return next();
    }

    try {
        const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);
        // Set on both req.userId (for GET) and req.body.userId (for POST)
        req.userId = tokenDecoded.id;
        req.body.userId = tokenDecoded.id;
        next();
    } catch (error) {
        // Invalid token, but still allow request - just without userId
        console.log('[OptionalAuth] Invalid token, proceeding without userId');
        req.userId = null;
        req.body.userId = null;
        next();
    }
};

export default optionalAuth;

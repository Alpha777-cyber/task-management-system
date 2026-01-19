const { verifyToken, getTokenFromHeaders } = require('../utils/jwt');

/**
 * Middleware to verify JWT token and protect routes
 * Extracts userId from token and attaches it to req.userId
 */
const requireAuth = (req, res, next) => {
    try {
        // Get token from request headers
        const token = getTokenFromHeaders(req);

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No token provided. Please include authorization token in headers.',
                hint: 'Send token as: Authorization: Bearer <token> or x-access-token header'
            });
        }

        // Verify token
        const { valid, decoded, expired, error } = verifyToken(token);

        // Handle expired token
        if (expired) {
            return res.status(401).json({
                success: false,
                error: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        // Handle invalid token
        if (!valid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: error
            });
        }

        // Attach userId to request object
        req.userId = decoded.userId;

        // Continue to next middleware/route handler
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Server error during authentication',
            message: error.message
        });
    }
};

/**
 * Optional middleware - doesn't block if no token provided
 * Useful for routes that work with or without authentication
 */
const optionalAuth = (req, res, next) => {
    try {
        // Get token from request headers
        const token = getTokenFromHeaders(req);

        if (token) {
            // Verify token if provided
            const { valid, decoded, error } = verifyToken(token);

            if (valid) {
                req.userId = decoded.userId;
                req.authenticated = true;
            } else {
                // Token provided but invalid - still continue
                req.authenticated = false;
            }
        } else {
            req.authenticated = false;
        }

        // Continue regardless of auth status
        next();

    } catch (error) {
        // Log error but continue
        req.authenticated = false;
        next();
    }
};

module.exports = {
    requireAuth,
    optionalAuth
};

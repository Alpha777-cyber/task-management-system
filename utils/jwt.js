const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },  // Payload
    process.env.JWT_SECRET,  // Secret key
    { expiresIn: process.env.JWT_EXPIRE }  // Expiration
  );
};

// Verify JWT Token
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { valid: true, decoded };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      expired: error.name === 'TokenExpiredError'
    };
  }
};

// Extract token from headers
const getTokenFromHeaders = (req) => {
  // Check Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]; // Extract token after "Bearer "
  }

  // Also check x-access-token header (alternative)
  if (req.headers['x-access-token']) {
    return req.headers['x-access-token'];
  }

  return null;
};

module.exports = {
  generateToken,
  verifyToken,
  getTokenFromHeaders
};
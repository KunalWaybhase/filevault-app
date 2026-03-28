const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Get token from request header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. Please login first.' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach user info to request
    next(); // allow request to continue
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token. Please login again.' });
  }
};
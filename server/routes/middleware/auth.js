const UserService = require('../../services/userService.js');
const jwt = require('jsonwebtoken');

const requireUser = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    return res.status(403).json({ error: 'Authentication required' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      console.warn('No authentication token provided');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (!roles.includes(decoded.role)) {
        console.warn(`User ${decoded.email} with role ${decoded.role} attempted to access endpoint requiring roles: ${roles.join(', ')}`);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error('Role verification error:', err);
      return res.status(403).json({ error: 'Authentication required' });
    }
  };
};

module.exports = {
  requireUser,
  requireRole,
};
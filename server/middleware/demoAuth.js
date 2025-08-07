const jwt = require('jsonwebtoken');

// Enhanced authentication middleware for demo system
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      error: 'Access token required',
      message: 'Please provide a valid authentication token'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo-secret-key');
    
    // Add user info to request object
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      name: decoded.name
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ 
        error: 'Token expired',
        message: 'Your session has expired. Please login again.'
      });
    }
    
    return res.status(403).json({ 
      error: 'Invalid token',
      message: 'The provided token is invalid'
    });
  }
};

// Role-based access control middleware
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please login to access this resource'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }
    
    next();
  };
};

// Admin only access
const requireAdmin = requireRole(['admin']);

// Manager or Admin access
const requireManagerOrAdmin = requireRole(['manager', 'admin']);

// Staff, Manager, or Admin access
const requireStaffOrAbove = requireRole(['staff', 'manager', 'admin']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireManagerOrAdmin,
  requireStaffOrAbove
};
import { verifyToken } from '../utils/jwt.js';

// Middleware to verify JWT token
export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token is required',
      });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Authentication failed',
      error: error.message,
    });
  }
};

// Middleware to check role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this resource',
      });
    }

    next();
  };
};

/**
 * Specific middleware for admin access
 */
export const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (req.user.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

/**
 * Middleware for admin or NGO manager access
 */
export const adminOrManager = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated',
    });
  }

  if (!['Admin', 'NGO_Manager'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin or Manager access required',
    });
  }

  next();
};

/**
 * Middleware to log audit trail
 */
export const auditLog = (action, entityType) => {
  return async (req, res, next) => {
    // Store audit info in request for later use
    req.auditInfo = {
      action,
      entityType,
      userId: req.user?.id,
      userName: req.user?.name,
      ipAddress: req.ip,
    };
    next();
  };
};

export default authMiddleware;

const jwt = require('jsonwebtoken');
const { asyncHandler } = require('./errorHandler');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');

/**
 * Protect routes - verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists - lean query for better performance
    const user = await User.findById(decoded.id)
      .select('-password -resetPasswordToken -resetPasswordExpire')
      .lean();

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User no longer exists'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: 'Account is inactive. Please contact support.'
      });
    }

    // Check if user is locked
    if (user.isLocked) {
      return res.status(403).json({
        success: false,
        error: 'Account is locked. Please try again later or contact support.'
      });
    }

    // Check if password was changed after token was issued (only if method exists)
    if (user.changedPasswordAfter && typeof user.changedPasswordAfter === 'function') {
      if (user.changedPasswordAfter(decoded.iat)) {
        return res.status(401).json({
          success: false,
          error: 'Password was recently changed. Please log in again.'
        });
      }
    }

    // Grant access
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please log in again.'
      });
    }
    
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
});

/**
 * Authorize specific roles
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user.role}' is not authorized to access this route`
      });
    }
    next();
  };
};

/**
 * Verify MFA token
 */
const verifyMFA = asyncHandler(async (req, res, next) => {
  const mfaToken = req.headers['x-mfa-token'];

  // If user doesn't have MFA enabled, skip verification
  if (!req.user.mfaEnabled) {
    return next();
  }

  // Check if MFA token is provided
  if (!mfaToken) {
    logger.warn('MFA token missing', {
      userId: req.user._id,
      ip: req.ip
    });
    
    return res.status(403).json({
      success: false,
      error: 'MFA token required',
      mfaRequired: true
    });
  }

  // Verify MFA token
  const isValid = req.user.verifyMFAToken(mfaToken);

  if (!isValid) {
    logger.warn('Invalid MFA token', {
      userId: req.user._id,
      ip: req.ip
    });
    
    await AuditLog.logAction({
      user: req.user._id,
      action: 'ACCESS_DENIED',
      resource: req.path,
      details: { reason: 'Invalid MFA token' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure',
      isSuspicious: true,
      suspiciousReasons: ['Invalid MFA token']
    });
    
    return res.status(403).json({
      success: false,
      error: 'Invalid MFA token'
    });
  }

  next();
});

/**
 * Check if user owns the resource or has permission to access it
 */
const checkResourceOwnership = (resourceType) => {
  return asyncHandler(async (req, res, next) => {
    const resourceId = req.params.id;
    const userId = req.user._id;
    const userRole = req.user.role;

    // Admins have access to all resources
    if (userRole === 'admin') {
      return next();
    }

    let hasAccess = false;

    switch (resourceType) {
      case 'healthRecord':
        const HealthRecord = require('../models/HealthRecord');
        const record = await HealthRecord.findById(resourceId);
        
        if (!record) {
          return res.status(404).json({
            success: false,
            error: 'Record not found'
          });
        }
        
        // Patient can access own records
        if (record.patient.toString() === userId.toString()) {
          hasAccess = true;
        }
        
        // Doctor can access if they created the record or are assigned to the patient
        if (userRole === 'doctor') {
          hasAccess = record.doctor.toString() === userId.toString() ||
                     req.user.assignedPatients.includes(record.patient);
        }
        
        break;

      case 'vitals':
        const Vitals = require('../models/Vitals');
        const vitals = await Vitals.findById(resourceId);
        
        if (!vitals) {
          return res.status(404).json({
            success: false,
            error: 'Vitals record not found'
          });
        }
        
        // Patient can access own vitals
        if (vitals.patient.toString() === userId.toString()) {
          hasAccess = true;
        }
        
        // Healthcare providers can access if patient is assigned to them
        if (userRole === 'doctor' || userRole === 'nurse') {
          hasAccess = req.user.assignedPatients.includes(vitals.patient);
        }
        
        break;

      case 'user':
        // Users can only access their own profile unless they're admin
        hasAccess = resourceId === userId.toString();
        break;

      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      logger.warn('Unauthorized resource access attempt', {
        userId,
        userRole,
        resourceType,
        resourceId,
        ip: req.ip
      });
      
      await AuditLog.logAction({
        user: userId,
        action: 'ACCESS_DENIED',
        resource: resourceType,
        resourceId,
        details: { reason: 'Not authorized to access this resource' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failure',
        isSuspicious: true,
        suspiciousReasons: ['Unauthorized resource access attempt']
      });
      
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this resource'
      });
    }

    next();
  });
};

module.exports = {
  protect,
  authorize,
  verifyMFA,
  checkResourceOwnership
};

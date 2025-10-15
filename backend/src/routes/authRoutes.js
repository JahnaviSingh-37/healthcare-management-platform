const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const qrcode = require('qrcode');
const { asyncHandler } = require('../middleware/errorHandler');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logger = require('../utils/logger');
const { generateToken } = require('../utils/encryption');
const { sendOTP, verifyOTP } = require('../utils/otp');

/**
 * Generate JWT token
 */
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '1h'
  });
};

/**
 * Generate refresh token
 */
const signRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
};

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', authLimiter, asyncHandler(async (req, res) => {
  const {
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    gender,
    role,
    licenseNumber,
    specialization
  } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      error: 'User with this email already exists'
    });
  }

  // Create user data object
  const userData = {
    email,
    password,
    firstName,
    lastName,
    dateOfBirth,
    phone,
    gender,
    role: role || 'patient',
    termsAccepted: true,
    privacyPolicyAccepted: true,
    dataProcessingConsent: true,
    consentDate: new Date()
  };

  // Add optional fields if provided
  if (licenseNumber) userData.licenseNumber = licenseNumber;
  if (specialization) userData.specialization = specialization;

  // Create user
  const user = await User.create(userData);

  // Log registration
  await AuditLog.logAction({
    user: user._id,
    action: 'USER_CREATE',
    resource: 'User',
    resourceId: user._id,
    details: { email, role: user.role },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PII', 'PHI']
  });

  logger.info('New user registered', {
    userId: user._id,
    email: user.email,
    role: user.role
  });

  // Generate tokens immediately (OTP optional for now)
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Try to send OTP for verification (optional)
  try {
    await sendOTP(email, 'registration');
    logger.info('OTP sent successfully after registration', { userId: user._id });
  } catch (otpError) {
    logger.warn('Failed to send OTP after registration (continuing without OTP)', { 
      error: otpError.message,
      userId: user._id 
    });
  }

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/v1/auth/verify-otp
 * @desc    Verify OTP and complete registration
 * @access  Public
 */
router.post('/verify-otp', authLimiter, asyncHandler(async (req, res) => {
  const { email, otp, purpose = 'registration' } = req.body;

  // Validate input
  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and OTP'
    });
  }

  // Verify OTP
  const isValid = await verifyOTP(email, otp, purpose);

  if (!isValid) {
    await AuditLog.logAction({
      user: null,
      action: 'OTP_VERIFICATION_FAILED',
      resource: 'Auth',
      details: { email, purpose },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure'
    });

    return res.status(400).json({
      success: false,
      error: 'Invalid or expired OTP. Please try again.'
    });
  }

  // Find user and mark as verified
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Log successful verification
  await AuditLog.logAction({
    user: user._id,
    action: 'OTP_VERIFIED',
    resource: 'Auth',
    details: { email, purpose },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  logger.info('OTP verified successfully', {
    userId: user._id,
    email: user.email,
    purpose
  });

  // Generate tokens
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  res.status(200).json({
    success: true,
    message: 'OTP verified successfully',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      },
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/v1/auth/resend-otp
 * @desc    Resend OTP
 * @access  Public
 */
router.post('/resend-otp', authLimiter, asyncHandler(async (req, res) => {
  const { email, purpose = 'registration' } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  // Send new OTP
  try {
    await sendOTP(email, purpose);
    
    await AuditLog.logAction({
      user: user._id,
      action: 'OTP_RESENT',
      resource: 'Auth',
      details: { email, purpose },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Please check your email.'
    });
  } catch (error) {
    logger.error('Failed to resend OTP', { error: error.message, email });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to send OTP. Please try again later.'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', authLimiter, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide email and password'
    });
  }

  // Check if user exists
  const user = await User.findOne({ email }).select('+password +mfaSecret');

  if (!user) {
    await AuditLog.logAction({
      user: null,
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      details: { email, reason: 'User not found' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure'
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Check if account is locked
  if (user.isLocked) {
    await AuditLog.logAction({
      user: user._id,
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      details: { email, reason: 'Account locked' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure',
      isSuspicious: true,
      suspiciousReasons: ['Login attempt on locked account']
    });

    logger.warn('Login attempt on locked account', {
      userId: user._id,
      email: user.email,
      ip: req.ip
    });

    return res.status(403).json({
      success: false,
      error: 'Account is locked. Please try again later or contact support.'
    });
  }

  // Check if password is correct
  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Increment login attempts
    await user.incLoginAttempts();

    await AuditLog.logAction({
      user: user._id,
      action: 'LOGIN_FAILED',
      resource: 'Auth',
      details: { email, reason: 'Invalid password' },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'failure'
    });

    logger.warn('Failed login attempt', {
      userId: user._id,
      email: user.email,
      ip: req.ip,
      attempts: user.loginAttempts + 1
    });

    return res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }

  // Update last login
  user.lastLogin = new Date();
  user.lastLoginIP = req.ip;
  await user.save();

  // If MFA is enabled, require MFA verification
  if (user.mfaEnabled) {
    // Generate temporary token for MFA verification
    const mfaToken = signToken(user._id);

    await AuditLog.logAction({
      user: user._id,
      action: 'LOGIN',
      resource: 'Auth',
      details: { email, mfaRequired: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    return res.status(200).json({
      success: true,
      mfaRequired: true,
      tempToken: mfaToken,
      message: 'Please provide MFA code'
    });
  }

  // Generate tokens
  const token = signToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Log successful login
  await AuditLog.logAction({
    user: user._id,
    action: 'LOGIN',
    resource: 'Auth',
    details: { email },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  logger.info('User logged in', {
    userId: user._id,
    email: user.email,
    ip: req.ip
  });

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        mfaEnabled: user.mfaEnabled
      },
      token,
      refreshToken
    }
  });
}));

/**
 * @route   POST /api/v1/auth/mfa/verify
 * @desc    Verify MFA code and complete login
 * @access  Public (with temp token)
 */
router.post('/mfa/verify', asyncHandler(async (req, res) => {
  const { tempToken, mfaCode } = req.body;

  if (!tempToken || !mfaCode) {
    return res.status(400).json({
      success: false,
      error: 'Please provide token and MFA code'
    });
  }

  try {
    // Verify temp token
    const decoded = jwt.verify(tempToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+mfaSecret');

    if (!user || !user.mfaEnabled) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }

    // Verify MFA code
    const isValid = user.verifyMFAToken(mfaCode);

    if (!isValid) {
      await AuditLog.logAction({
        user: user._id,
        action: 'LOGIN_FAILED',
        resource: 'Auth',
        details: { reason: 'Invalid MFA code' },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        status: 'failure',
        isSuspicious: true,
        suspiciousReasons: ['Invalid MFA code']
      });

      return res.status(401).json({
        success: false,
        error: 'Invalid MFA code'
      });
    }

    // Generate final tokens
    const token = signToken(user._id);
    const refreshToken = signRefreshToken(user._id);

    // Log successful MFA verification
    await AuditLog.logAction({
      user: user._id,
      action: 'LOGIN',
      resource: 'Auth',
      details: { email: user.email, mfaVerified: true },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      status: 'success'
    });

    res.status(200).json({
      success: true,
      message: 'MFA verification successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        token,
        refreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token is required'
    });
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = signToken(user._id);
    const newRefreshToken = signRefreshToken(user._id);

    res.status(200).json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token'
    });
  }
}));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', protect, asyncHandler(async (req, res) => {
  await AuditLog.logAction({
    user: req.user._id,
    action: 'LOGOUT',
    resource: 'Auth',
    details: { email: req.user.email },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
}));

/**
 * @route   GET /api/v1/auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
const passport = require('../config/passport');

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

/**
 * @route   GET /api/v1/auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/login?error=oauth_failed` }),
  asyncHandler(async (req, res) => {
    // Generate tokens
    const token = signToken(req.user._id);
    const refreshToken = signRefreshToken(req.user._id);

    // Redirect to frontend with tokens
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/oauth/callback?token=${token}&refreshToken=${refreshToken}`);
  })
);

module.exports = router;

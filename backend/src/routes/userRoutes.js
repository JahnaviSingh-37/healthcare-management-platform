const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, checkResourceOwnership } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/users
 * @desc    Get users (with optional role filter)
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { role } = req.query;
  
  let query = {};
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select('firstName lastName email phone role specialization licenseNumber address dateOfBirth gender')
    .sort({ firstName: 1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
}));

/**
 * @route   GET /api/v1/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('assignedDoctor', 'firstName lastName specialization email phone')
    .populate('assignedPatients', 'firstName lastName email phone');

  res.status(200).json({
    success: true,
    data: user
  });
}));

/**
 * @route   PUT /api/v1/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const fieldsToUpdate = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    phone: req.body.phone,
    address: req.body.address,
    bio: req.body.bio,
    profilePicture: req.body.profilePicture
  };

  // Remove undefined fields
  Object.keys(fieldsToUpdate).forEach(
    key => fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
  );

  const user = await User.findByIdAndUpdate(
    req.user._id,
    fieldsToUpdate,
    { new: true, runValidators: true }
  );

  await AuditLog.logAction({
    user: req.user._id,
    action: 'PROFILE_UPDATE',
    resource: 'User',
    resourceId: user._id,
    details: { updatedFields: Object.keys(fieldsToUpdate) },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PII']
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
}));

/**
 * @route   PUT /api/v1/users/change-password
 * @desc    Change password
 * @access  Private
 */
router.put('/change-password', protect, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  await AuditLog.logAction({
    user: req.user._id,
    action: 'PASSWORD_CHANGE',
    resource: 'User',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully'
  });
}));

/**
 * @route   POST /api/v1/users/mfa/setup
 * @desc    Setup MFA
 * @access  Private
 */
router.post('/mfa/setup', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user.mfaEnabled) {
    return res.status(400).json({
      success: false,
      error: 'MFA is already enabled'
    });
  }

  const { secret, qrCode } = user.generateMFASecret();
  user.mfaSecret = secret;
  
  // Generate backup codes
  const backupCodes = user.generateBackupCodes();
  user.mfaBackupCodes = backupCodes;
  
  await user.save();

  res.status(200).json({
    success: true,
    message: 'MFA setup initiated',
    data: {
      secret,
      qrCode,
      backupCodes
    }
  });
}));

/**
 * @route   POST /api/v1/users/mfa/enable
 * @desc    Enable MFA after verification
 * @access  Private
 */
router.post('/mfa/enable', protect, asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = await User.findById(req.user._id).select('+mfaSecret');

  if (!user.mfaSecret) {
    return res.status(400).json({
      success: false,
      error: 'MFA setup not initiated'
    });
  }

  // Verify token
  const isValid = user.verifyMFAToken(token);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      error: 'Invalid MFA token'
    });
  }

  user.mfaEnabled = true;
  await user.save();

  await AuditLog.logAction({
    user: req.user._id,
    action: 'MFA_ENABLED',
    resource: 'User',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: 'MFA enabled successfully'
  });
}));

/**
 * @route   POST /api/v1/users/mfa/disable
 * @desc    Disable MFA
 * @access  Private
 */
router.post('/mfa/disable', protect, asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select('+password +mfaSecret +mfaBackupCodes');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      error: 'Password is incorrect'
    });
  }

  user.mfaEnabled = false;
  user.mfaSecret = undefined;
  user.mfaBackupCodes = undefined;
  await user.save();

  await AuditLog.logAction({
    user: req.user._id,
    action: 'MFA_DISABLED',
    resource: 'User',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: 'MFA disabled successfully'
  });
}));

module.exports = router;

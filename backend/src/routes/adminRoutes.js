const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const HealthRecord = require('../models/HealthRecord');
const Vitals = require('../models/Vitals');

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users
 * @access  Private (Admin)
 */
router.get('/users', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { role, isActive, search } = req.query;

  let query = {};

  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === 'true';
  if (search) {
    query.$or = [
      { email: { $regex: search, $options: 'i' } },
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } }
    ];
  }

  const users = await User.find(query)
    .select('-password -mfaSecret -mfaBackupCodes')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: users.length,
    data: users
  });
}));

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs
 * @access  Private (Admin)
 */
router.get('/audit-logs', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { userId, action, startDate, endDate, limit = 100 } = req.query;

  let query = {};

  if (userId) query.user = userId;
  if (action) query.action = action;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .populate('user', 'email firstName lastName role')
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
}));

/**
 * @route   GET /api/v1/admin/security-alerts
 * @desc    Get security alerts
 * @access  Private (Admin)
 */
router.get('/security-alerts', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { days = 7, minRiskScore = 50 } = req.query;

  const alerts = await AuditLog.getSuspiciousActivities(
    parseInt(days),
    parseInt(minRiskScore)
  );

  res.status(200).json({
    success: true,
    count: alerts.length,
    data: alerts
  });
}));

/**
 * @route   GET /api/v1/admin/statistics
 * @desc    Get system statistics
 * @access  Private (Admin)
 */
router.get('/statistics', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalPatients,
    totalDoctors,
    totalRecords,
    totalVitals,
    recentLogins
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'patient' }),
    User.countDocuments({ role: 'doctor' }),
    HealthRecord.countDocuments(),
    Vitals.countDocuments(),
    AuditLog.countDocuments({
      action: 'LOGIN',
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        patients: totalPatients,
        doctors: totalDoctors
      },
      records: {
        healthRecords: totalRecords,
        vitals: totalVitals
      },
      activity: {
        loginsLast24h: recentLogins
      }
    }
  });
}));

/**
 * @route   PUT /api/v1/admin/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin)
 */
router.put('/users/:id/status', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await AuditLog.logAction({
    user: req.user._id,
    action: 'USER_UPDATE',
    resource: 'User',
    resourceId: user._id,
    details: { 
      action: isActive ? 'activated' : 'deactivated',
      targetUser: user.email
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
}));

/**
 * @route   PUT /api/v1/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Admin)
 */
router.put('/users/:id/role', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!['patient', 'doctor', 'nurse', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found'
    });
  }

  await AuditLog.logAction({
    user: req.user._id,
    action: 'ROLE_CHANGE',
    resource: 'User',
    resourceId: user._id,
    details: { 
      newRole: role,
      targetUser: user.email
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success'
  });

  res.status(200).json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
}));

module.exports = router;

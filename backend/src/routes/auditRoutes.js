const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/audit/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Private (Admin or own logs)
 */
router.get('/user/:userId', protect, asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { limit = 50 } = req.query;

  // Check authorization
  if (req.user.role !== 'admin' && userId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access these audit logs'
    });
  }

  const logs = await AuditLog.getUserActivity(userId, parseInt(limit));

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
}));

/**
 * @route   GET /api/v1/audit/my-activity
 * @desc    Get current user's activity logs
 * @access  Private
 */
router.get('/my-activity', protect, asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;

  const logs = await AuditLog.getUserActivity(req.user._id, parseInt(limit));

  res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
}));

module.exports = router;

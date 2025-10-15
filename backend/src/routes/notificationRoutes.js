const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Notification = require('../models/Notification');

/**
 * @route   GET /api/v1/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { read, type, priority } = req.query;
  
  let query = { user: req.user._id };
  
  // Filter by read status
  if (read !== undefined) {
    query.read = read === 'true';
  }
  
  // Filter by type
  if (type) {
    query.type = type;
  }
  
  // Filter by priority
  if (priority) {
    query.priority = priority;
  }
  
  const notifications = await Notification.find(query)
    .sort('-createdAt')
    .limit(50);
  
  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
}));

/**
 * @route   GET /api/v1/notifications/unread-count
 * @desc    Get count of unread notifications
 * @access  Private
 */
router.get('/unread-count', protect, asyncHandler(async (req, res) => {
  const count = await Notification.getUnreadCount(req.user._id);
  
  res.json({
    success: true,
    data: { count }
  });
}));

/**
 * @route   GET /api/v1/notifications/:id
 * @desc    Get single notification
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  // Check if notification belongs to user
  if (!notification.user.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this notification'
    });
  }
  
  res.json({
    success: true,
    data: notification
  });
}));

/**
 * @route   PUT /api/v1/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/read', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  // Check if notification belongs to user
  if (!notification.user.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this notification'
    });
  }
  
  await notification.markAsRead();
  
  res.json({
    success: true,
    data: notification
  });
}));

/**
 * @route   PUT /api/v1/notifications/mark-all-read
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/mark-all-read', protect, asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true, readAt: new Date() }
  );
  
  res.json({
    success: true,
    data: { modified: result.modifiedCount }
  });
}));

/**
 * @route   DELETE /api/v1/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const notification = await Notification.findById(req.params.id);
  
  if (!notification) {
    return res.status(404).json({
      success: false,
      error: 'Notification not found'
    });
  }
  
  // Check if notification belongs to user
  if (!notification.user.equals(req.user._id)) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this notification'
    });
  }
  
  await notification.deleteOne();
  
  res.json({
    success: true,
    data: {}
  });
}));

/**
 * @route   DELETE /api/v1/notifications
 * @desc    Delete all notifications for user
 * @access  Private
 */
router.delete('/', protect, asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({ user: req.user._id });
  
  res.json({
    success: true,
    data: { deleted: result.deletedCount }
  });
}));

module.exports = router;

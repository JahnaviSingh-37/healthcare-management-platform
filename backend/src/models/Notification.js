const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: [
        'appointment',
        'prescription',
        'health_record',
        'vitals',
        'security',
        'system',
        'reminder',
        'alert',
        'message'
      ],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    read: {
      type: Boolean,
      default: false
    },
    readAt: Date,
    actionUrl: String,
    actionText: String,
    data: {
      type: mongoose.Schema.Types.Mixed
    },
    expiresAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(userId, data) {
  return this.create({
    user: userId,
    ...data
  });
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ user: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);

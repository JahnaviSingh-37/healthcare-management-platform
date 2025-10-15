const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    action: {
      type: String,
      required: true,
      enum: [
        'LOGIN',
        'LOGOUT',
        'LOGIN_FAILED',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        'MFA_ENABLED',
        'MFA_DISABLED',
        'PROFILE_UPDATE',
        'RECORD_CREATE',
        'RECORD_READ',
        'RECORD_UPDATE',
        'RECORD_DELETE',
        'VITALS_CREATE',
        'VITALS_READ',
        'FILE_UPLOAD',
        'FILE_DOWNLOAD',
        'ACCESS_DENIED',
        'ROLE_CHANGE',
        'USER_CREATE',
        'USER_DELETE',
        'EXPORT_DATA',
        'CONSENT_UPDATE',
        'SUSPICIOUS_ACTIVITY'
      ]
    },
    resource: {
      type: String,
      required: true
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId
    },
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    status: {
      type: String,
      enum: ['success', 'failure', 'warning'],
      default: 'success'
    },
    errorMessage: String,
    // Security flags
    isSuspicious: {
      type: Boolean,
      default: false
    },
    suspiciousReasons: [String],
    riskScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    // Compliance
    hipaaCompliant: {
      type: Boolean,
      default: true
    },
    dataCategories: [{
      type: String,
      enum: ['PHI', 'PII', 'FINANCIAL', 'CLINICAL', 'ADMINISTRATIVE']
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Indexes for efficient queries
auditLogSchema.index({ user: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ isSuspicious: 1, timestamp: -1 });
auditLogSchema.index({ ipAddress: 1 });

// TTL index for automatic deletion after retention period (7 years for HIPAA)
auditLogSchema.index(
  { timestamp: 1 },
  { 
    expireAfterSeconds: parseInt(process.env.AUDIT_LOG_RETENTION_DAYS || 2555) * 24 * 60 * 60 
  }
);

// Static method to log an action
auditLogSchema.statics.logAction = async function(logData) {
  try {
    const log = new this(logData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent audit logging from breaking the application
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = async function(userId, limit = 50) {
  return await this.find({ user: userId })
    .sort({ timestamp: -1 })
    .limit(limit)
    .select('-__v');
};

// Static method to get suspicious activities
auditLogSchema.statics.getSuspiciousActivities = async function(days = 7, minRiskScore = 50) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return await this.find({
    timestamp: { $gte: startDate },
    $or: [
      { isSuspicious: true },
      { riskScore: { $gte: minRiskScore } }
    ]
  })
  .populate('user', 'email firstName lastName role')
  .sort({ riskScore: -1, timestamp: -1 });
};

// Static method to get login attempts
auditLogSchema.statics.getLoginAttempts = async function(email, minutes = 15) {
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - minutes);
  
  // Find user by email
  const User = mongoose.model('User');
  const user = await User.findOne({ email });
  
  if (!user) return [];
  
  return await this.find({
    user: user._id,
    action: { $in: ['LOGIN', 'LOGIN_FAILED'] },
    timestamp: { $gte: startTime }
  })
  .sort({ timestamp: -1 });
};

// Static method to detect anomalies
auditLogSchema.statics.detectAnomalies = async function(userId, recentMinutes = 60) {
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() - recentMinutes);
  
  const recentLogs = await this.find({
    user: userId,
    timestamp: { $gte: startTime }
  });
  
  const anomalies = [];
  
  // Check for multiple IPs
  const ips = [...new Set(recentLogs.map(log => log.ipAddress))];
  if (ips.length > 3) {
    anomalies.push('Multiple IP addresses detected');
  }
  
  // Check for rapid requests
  if (recentLogs.length > 100) {
    anomalies.push('Unusually high number of requests');
  }
  
  // Check for failed login attempts
  const failedLogins = recentLogs.filter(log => log.action === 'LOGIN_FAILED').length;
  if (failedLogins > 3) {
    anomalies.push('Multiple failed login attempts');
  }
  
  // Check for unusual access patterns
  const accessDenied = recentLogs.filter(log => log.action === 'ACCESS_DENIED').length;
  if (accessDenied > 5) {
    anomalies.push('Multiple access denied events');
  }
  
  return anomalies;
};

// Method to mark as suspicious
auditLogSchema.methods.markSuspicious = async function(reasons) {
  this.isSuspicious = true;
  this.suspiciousReasons = reasons;
  this.riskScore = Math.min(100, this.riskScore + (reasons.length * 20));
  await this.save();
};

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;

const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize, checkResourceOwnership } = require('../middleware/auth');
const HealthRecord = require('../models/HealthRecord');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/health-records
 * @desc    Get all health records (with filters based on role)
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  const { startDate, endDate, recordType, status } = req.query;

  let query = {};

  // Role-based filtering
  if (role === 'patient') {
    query.patient = userId;
  } else if (role === 'doctor') {
    query.$or = [
      { doctor: userId },
      { patient: { $in: req.user.assignedPatients } }
    ];
  } else if (role === 'nurse') {
    query.patient = { $in: req.user.assignedPatients };
    query.isConfidential = false;
  }

  // Additional filters
  if (recordType) query.recordType = recordType;
  if (status) query.status = status;
  if (startDate || endDate) {
    query.visitDate = {};
    if (startDate) query.visitDate.$gte = new Date(startDate);
    if (endDate) query.visitDate.$lte = new Date(endDate);
  }

  const records = await HealthRecord.find(query)
    .populate('patient', 'firstName lastName email')
    .populate('doctor', 'firstName lastName specialization')
    .sort({ visitDate: -1 });

  // Log access
  await AuditLog.logAction({
    user: userId,
    action: 'RECORD_READ',
    resource: 'HealthRecord',
    details: { count: records.length, filters: req.query },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    count: records.length,
    data: records
  });
}));

/**
 * @route   GET /api/v1/health-records/:id
 * @desc    Get single health record
 * @access  Private
 */
router.get('/:id', protect, checkResourceOwnership('healthRecord'), asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id)
    .populate('patient', 'firstName lastName email dateOfBirth')
    .populate('doctor', 'firstName lastName specialization');

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Health record not found'
    });
  }

  // Log access
  await record.logAccess(req.user._id, 'READ', req.ip);

  await AuditLog.logAction({
    user: req.user._id,
    action: 'RECORD_READ',
    resource: 'HealthRecord',
    resourceId: record._id,
    details: { patientId: record.patient._id },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    data: record
  });
}));

/**
 * @route   POST /api/v1/health-records
 * @desc    Create new health record
 * @access  Private (Doctor, Admin)
 */
router.post('/', protect, authorize('doctor', 'admin'), asyncHandler(async (req, res) => {
  const recordData = {
    ...req.body,
    doctor: req.user._id
  };

  const record = await HealthRecord.create(recordData);

  await AuditLog.logAction({
    user: req.user._id,
    action: 'RECORD_CREATE',
    resource: 'HealthRecord',
    resourceId: record._id,
    details: { 
      patientId: record.patient,
      recordType: record.recordType
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(201).json({
    success: true,
    message: 'Health record created successfully',
    data: record
  });
}));

/**
 * @route   PUT /api/v1/health-records/:id
 * @desc    Update health record
 * @access  Private (Doctor, Admin)
 */
router.put('/:id', protect, authorize('doctor', 'admin'), checkResourceOwnership('healthRecord'), asyncHandler(async (req, res) => {
  let record = await HealthRecord.findById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Health record not found'
    });
  }

  record = await HealthRecord.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  // Log update
  await record.logAccess(req.user._id, 'UPDATE', req.ip);

  await AuditLog.logAction({
    user: req.user._id,
    action: 'RECORD_UPDATE',
    resource: 'HealthRecord',
    resourceId: record._id,
    details: { 
      patientId: record.patient,
      changes: Object.keys(req.body)
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    message: 'Health record updated successfully',
    data: record
  });
}));

/**
 * @route   DELETE /api/v1/health-records/:id
 * @desc    Delete health record (soft delete - archive)
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const record = await HealthRecord.findById(req.params.id);

  if (!record) {
    return res.status(404).json({
      success: false,
      error: 'Health record not found'
    });
  }

  // Soft delete - archive the record
  record.status = 'archived';
  await record.save();

  await AuditLog.logAction({
    user: req.user._id,
    action: 'RECORD_DELETE',
    resource: 'HealthRecord',
    resourceId: record._id,
    details: { patientId: record.patient },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    message: 'Health record archived successfully'
  });
}));

module.exports = router;

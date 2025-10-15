const express = require('express');
const router = express.Router();
const { asyncHandler } = require('../middleware/errorHandler');
const { protect, authorize } = require('../middleware/auth');
const Vitals = require('../models/Vitals');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/vitals
 * @desc    Get vitals (filtered by role)
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  const { role, _id: userId } = req.user;
  const { patientId, startDate, endDate, limit = 50 } = req.query;

  let query = {};

  // Role-based filtering
  if (role === 'patient') {
    query.patient = userId;
  } else if (patientId) {
    // Healthcare providers can query by patient ID if assigned
    if (role === 'doctor' || role === 'nurse') {
      if (!req.user.assignedPatients.includes(patientId)) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to access this patient\'s vitals'
        });
      }
    }
    query.patient = patientId;
  }

  // Date range filter
  if (startDate || endDate) {
    query.recordDate = {};
    if (startDate) query.recordDate.$gte = new Date(startDate);
    if (endDate) query.recordDate.$lte = new Date(endDate);
  }

  const vitals = await Vitals.find(query)
    .populate('patient', 'firstName lastName')
    .populate('recordedBy', 'firstName lastName role')
    .sort({ recordDate: -1 })
    .limit(parseInt(limit));

  await AuditLog.logAction({
    user: userId,
    action: 'VITALS_READ',
    resource: 'Vitals',
    details: { count: vitals.length, filters: req.query },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    count: vitals.length,
    data: vitals
  });
}));

/**
 * @route   GET /api/v1/vitals/latest/:patientId
 * @desc    Get latest vitals for a patient
 * @access  Private
 */
router.get('/latest/:patientId', protect, asyncHandler(async (req, res) => {
  const { patientId } = req.params;
  const { role, _id: userId } = req.user;

  // Check authorization
  if (role === 'patient' && patientId !== userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this patient\'s vitals'
    });
  }

  if ((role === 'doctor' || role === 'nurse') && !req.user.assignedPatients.includes(patientId)) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this patient\'s vitals'
    });
  }

  const vitals = await Vitals.getLatestVitals(patientId);

  if (!vitals) {
    return res.status(404).json({
      success: false,
      error: 'No vitals found for this patient'
    });
  }

  res.status(200).json({
    success: true,
    data: vitals
  });
}));

/**
 * @route   GET /api/v1/vitals/trend/:patientId/:vitalType
 * @desc    Get vitals trend for a patient
 * @access  Private
 */
router.get('/trend/:patientId/:vitalType', protect, asyncHandler(async (req, res) => {
  const { patientId, vitalType } = req.params;
  const { days = 30 } = req.query;
  const { role, _id: userId } = req.user;

  // Check authorization
  if (role === 'patient' && patientId !== userId.toString()) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this patient\'s vitals'
    });
  }

  const trend = await Vitals.getVitalsTrend(patientId, vitalType, parseInt(days));

  res.status(200).json({
    success: true,
    count: trend.length,
    data: trend
  });
}));

/**
 * @route   POST /api/v1/vitals
 * @desc    Create new vitals record
 * @access  Private (Doctor, Nurse)
 */
router.post('/', protect, authorize('doctor', 'nurse', 'admin'), asyncHandler(async (req, res) => {
  const vitalsData = {
    ...req.body,
    recordedBy: req.user._id
  };

  const vitals = await Vitals.create(vitalsData);

  await AuditLog.logAction({
    user: req.user._id,
    action: 'VITALS_CREATE',
    resource: 'Vitals',
    resourceId: vitals._id,
    details: { 
      patientId: vitals.patient,
      isAbnormal: vitals.isAbnormal,
      abnormalityFlags: vitals.abnormalityFlags
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(201).json({
    success: true,
    message: 'Vitals recorded successfully',
    data: vitals
  });
}));

/**
 * @route   PUT /api/v1/vitals/:id
 * @desc    Update vitals record
 * @access  Private (Doctor, Nurse, Admin)
 */
router.put('/:id', protect, authorize('doctor', 'nurse', 'admin'), asyncHandler(async (req, res) => {
  let vitals = await Vitals.findById(req.params.id);

  if (!vitals) {
    return res.status(404).json({
      success: false,
      error: 'Vitals record not found'
    });
  }

  vitals = await Vitals.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );

  await AuditLog.logAction({
    user: req.user._id,
    action: 'VITALS_UPDATE',
    resource: 'Vitals',
    resourceId: vitals._id,
    details: { 
      patientId: vitals.patient,
      changes: Object.keys(req.body)
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    message: 'Vitals updated successfully',
    data: vitals
  });
}));

/**
 * @route   DELETE /api/v1/vitals/:id
 * @desc    Delete vitals record
 * @access  Private (Admin only)
 */
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
  const vitals = await Vitals.findById(req.params.id);

  if (!vitals) {
    return res.status(404).json({
      success: false,
      error: 'Vitals record not found'
    });
  }

  await vitals.deleteOne();

  await AuditLog.logAction({
    user: req.user._id,
    action: 'VITALS_DELETE',
    resource: 'Vitals',
    resourceId: vitals._id,
    details: { patientId: vitals.patient },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
    status: 'success',
    dataCategories: ['PHI', 'CLINICAL']
  });

  res.status(200).json({
    success: true,
    message: 'Vitals deleted successfully'
  });
}));

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/prescriptions
 * @desc    Get all prescriptions (filtered by role)
 * @access  Private
 */
router.get('/', protect, asyncHandler(async (req, res) => {
  let query = {};
  
  // Filter based on role
  if (req.user.role === 'patient') {
    query.patient = req.user._id;
  } else if (req.user.role === 'doctor') {
    query.doctor = req.user._id;
  }
  // Admin can see all
  
  const prescriptions = await Prescription.find(query)
    .populate('patient', 'firstName lastName email')
    .populate('doctor', 'firstName lastName specialization licenseNumber')
    .sort('-createdAt');
  
  res.json({
    success: true,
    count: prescriptions.length,
    data: prescriptions
  });
}));

/**
 * @route   GET /api/v1/prescriptions/:id
 * @desc    Get single prescription
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone dateOfBirth')
    .populate('doctor', 'firstName lastName specialization licenseNumber email');
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  // Check permissions
  const isOwner = prescription.patient._id.equals(req.user._id);
  const isDoctor = prescription.doctor._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  
  if (!isOwner && !isDoctor && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this prescription'
    });
  }
  
  // Log access
  await AuditLog.logAction({
    user: req.user._id,
    action: 'PRESCRIPTION_VIEW',
    resource: 'Prescription',
    resourceId: prescription._id,
    details: { prescriptionId: prescription.prescriptionId }
  });
  
  res.json({
    success: true,
    data: prescription
  });
}));

/**
 * @route   POST /api/v1/prescriptions
 * @desc    Create new prescription
 * @access  Private (Doctor only)
 */
router.post('/', protect, authorize('doctor', 'admin'), asyncHandler(async (req, res) => {
  const {
    patientId,
    diagnosis,
    medications,
    labTests,
    followUpDate,
    notes,
    pharmacyNotes,
    validUntil
  } = req.body;
  
  // Verify patient exists
  const patient = await User.findById(patientId);
  if (!patient) {
    return res.status(404).json({
      success: false,
      error: 'Patient not found'
    });
  }
  
  // Create prescription
  const prescription = await Prescription.create({
    patient: patientId,
    doctor: req.user._id,
    diagnosis,
    medications,
    labTests,
    followUpDate,
    notes,
    pharmacyNotes,
    validUntil: validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days default
    signature: {
      doctorName: `Dr. ${req.user.firstName} ${req.user.lastName}`,
      licenseNumber: req.user.licenseNumber,
      digitalSignature: `${req.user._id}-${Date.now()}`
    }
  });
  
  // Populate data
  await prescription.populate('patient', 'firstName lastName email');
  await prescription.populate('doctor', 'firstName lastName specialization licenseNumber');
  
  // Create notification for patient
  await Notification.createNotification(patientId, {
    title: 'New Prescription',
    message: `Dr. ${req.user.firstName} ${req.user.lastName} has issued a new prescription for you.`,
    type: 'prescription',
    priority: 'high',
    actionUrl: `/prescriptions/${prescription._id}`,
    actionText: 'View Prescription',
    data: { prescriptionId: prescription._id }
  });
  
  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    action: 'PRESCRIPTION_CREATE',
    resource: 'Prescription',
    resourceId: prescription._id,
    details: {
      patientId,
      diagnosis,
      medicationCount: medications.length
    }
  });
  
  res.status(201).json({
    success: true,
    data: prescription
  });
}));

/**
 * @route   PUT /api/v1/prescriptions/:id
 * @desc    Update prescription
 * @access  Private (Doctor who created it)
 */
router.put('/:id', protect, authorize('doctor', 'admin'), asyncHandler(async (req, res) => {
  let prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  // Check if doctor owns this prescription
  if (!prescription.doctor.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this prescription'
    });
  }
  
  prescription = await Prescription.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('patient doctor');
  
  // Notify patient
  await Notification.createNotification(prescription.patient._id, {
    title: 'Prescription Updated',
    message: 'Your prescription has been updated by your doctor.',
    type: 'prescription',
    priority: 'normal',
    actionUrl: `/prescriptions/${prescription._id}`,
    data: { prescriptionId: prescription._id }
  });
  
  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    action: 'PRESCRIPTION_UPDATE',
    resource: 'Prescription',
    resourceId: prescription._id
  });
  
  res.json({
    success: true,
    data: prescription
  });
}));

/**
 * @route   DELETE /api/v1/prescriptions/:id
 * @desc    Cancel/Delete prescription
 * @access  Private (Doctor who created it or Admin)
 */
router.delete('/:id', protect, authorize('doctor', 'admin'), asyncHandler(async (req, res) => {
  const prescription = await Prescription.findById(req.params.id);
  
  if (!prescription) {
    return res.status(404).json({
      success: false,
      error: 'Prescription not found'
    });
  }
  
  // Check permissions
  if (!prescription.doctor.equals(req.user._id) && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to cancel this prescription'
    });
  }
  
  prescription.status = 'cancelled';
  await prescription.save();
  
  // Notify patient
  await Notification.createNotification(prescription.patient, {
    title: 'Prescription Cancelled',
    message: 'Your prescription has been cancelled.',
    type: 'prescription',
    priority: 'high'
  });
  
  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    action: 'PRESCRIPTION_CANCEL',
    resource: 'Prescription',
    resourceId: prescription._id
  });
  
  res.json({
    success: true,
    data: {}
  });
}));

module.exports = router;

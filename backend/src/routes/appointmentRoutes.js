const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');

/**
 * @route   GET /api/v1/appointments
 * @desc    Get all appointments (filtered by role)
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
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by date range
  if (req.query.startDate && req.query.endDate) {
    query.appointmentDate = {
      $gte: new Date(req.query.startDate),
      $lte: new Date(req.query.endDate)
    };
  }
  
  const appointments = await Appointment.find(query)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization')
    .sort('appointmentDate startTime');
  
  res.json({
    success: true,
    count: appointments.length,
    data: appointments
  });
}));

/**
 * @route   POST /api/v1/appointments
 * @desc    Book new appointment
 * @access  Private (Patient)
 */
router.post('/', protect, asyncHandler(async (req, res) => {
  const {
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    type,
    reason,
    symptoms,
    notes
  } = req.body;
  
  // Verify doctor exists
  const doctor = await User.findById(doctorId);
  if (!doctor || doctor.role !== 'doctor') {
    return res.status(404).json({
      success: false,
      error: 'Doctor not found'
    });
  }
  
  // Check if slot is available
  const isAvailable = await Appointment.isSlotAvailable(
    doctorId,
    appointmentDate,
    startTime,
    endTime
  );
  
  if (!isAvailable) {
    return res.status(400).json({
      success: false,
      error: 'This time slot is not available'
    });
  }
  
  // Calculate duration
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  const duration = (end - start) / (1000 * 60); // in minutes
  
  // Create appointment
  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctorId,
    appointmentDate,
    startTime,
    endTime,
    duration,
    type: type || 'in-person',
    reason,
    symptoms,
    notes
  });
  
  await appointment.populate('patient doctor');
  
  // Notify doctor
  await Notification.createNotification(doctorId, {
    title: 'New Appointment Booked',
    message: `${req.user.firstName} ${req.user.lastName} has booked an appointment with you.`,
    type: 'appointment',
    priority: 'normal',
    actionUrl: `/appointments/${appointment._id}`,
    actionText: 'View Appointment',
    data: { appointmentId: appointment._id }
  });
  
  // Notify patient
  await Notification.createNotification(req.user._id, {
    title: 'Appointment Confirmed',
    message: `Your appointment with Dr. ${doctor.firstName} ${doctor.lastName} has been scheduled.`,
    type: 'appointment',
    priority: 'high',
    actionUrl: `/appointments/${appointment._id}`,
    data: { appointmentId: appointment._id }
  });
  
  // Log action
  await AuditLog.logAction({
    user: req.user._id,
    action: 'APPOINTMENT_CREATE',
    resource: 'Appointment',
    resourceId: appointment._id,
    details: { doctorId, appointmentDate, type }
  });
  
  res.status(201).json({
    success: true,
    data: appointment
  });
}));

/**
 * @route   GET /api/v1/appointments/:id
 * @desc    Get single appointment
 * @access  Private
 */
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient', 'firstName lastName email phone')
    .populate('doctor', 'firstName lastName specialization licenseNumber')
    .populate('prescription');
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment not found'
    });
  }
  
  // Check permissions
  const isPatient = appointment.patient._id.equals(req.user._id);
  const isDoctor = appointment.doctor._id.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  
  if (!isPatient && !isDoctor && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to access this appointment'
    });
  }
  
  res.json({
    success: true,
    data: appointment
  });
}));

/**
 * @route   PUT /api/v1/appointments/:id
 * @desc    Update appointment (reschedule or update status)
 * @access  Private
 */
router.put('/:id', protect, asyncHandler(async (req, res) => {
  let appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment not found'
    });
  }
  
  // Check permissions
  const isPatient = appointment.patient.equals(req.user._id);
  const isDoctor = appointment.doctor.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  
  if (!isPatient && !isDoctor && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this appointment'
    });
  }
  
  // If rescheduling, check availability
  if (req.body.appointmentDate || req.body.startTime || req.body.endTime) {
    const isAvailable = await Appointment.isSlotAvailable(
      appointment.doctor,
      req.body.appointmentDate || appointment.appointmentDate,
      req.body.startTime || appointment.startTime,
      req.body.endTime || appointment.endTime,
      appointment._id
    );
    
    if (!isAvailable) {
      return res.status(400).json({
        success: false,
        error: 'This time slot is not available'
      });
    }
  }
  
  appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('patient doctor');
  
  // Notify other party
  const notifyUserId = isPatient ? appointment.doctor._id : appointment.patient._id;
  await Notification.createNotification(notifyUserId, {
    title: 'Appointment Updated',
    message: `An appointment has been updated.`,
    type: 'appointment',
    priority: 'high',
    actionUrl: `/appointments/${appointment._id}`,
    data: { appointmentId: appointment._id }
  });
  
  res.json({
    success: true,
    data: appointment
  });
}));

/**
 * @route   DELETE /api/v1/appointments/:id
 * @desc    Cancel appointment
 * @access  Private
 */
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const appointment = await Appointment.findById(req.params.id);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      error: 'Appointment not found'
    });
  }
  
  // Check permissions
  const isPatient = appointment.patient.equals(req.user._id);
  const isDoctor = appointment.doctor.equals(req.user._id);
  const isAdmin = req.user.role === 'admin';
  
  if (!isPatient && !isDoctor && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to cancel this appointment'
    });
  }
  
  appointment.status = 'cancelled';
  appointment.cancelledBy = req.user._id;
  appointment.cancellationReason = req.body.reason;
  await appointment.save();
  
  // Notify other party
  const notifyUserId = isPatient ? appointment.doctor : appointment.patient;
  await Notification.createNotification(notifyUserId, {
    title: 'Appointment Cancelled',
    message: 'An appointment has been cancelled.',
    type: 'appointment',
    priority: 'high',
    data: { appointmentId: appointment._id, reason: req.body.reason }
  });
  
  res.json({
    success: true,
    data: {}
  });
}));

/**
 * @route   GET /api/v1/appointments/available-slots/:doctorId
 * @desc    Get available time slots for a doctor
 * @access  Private
 */
router.get('/available-slots/:doctorId', protect, asyncHandler(async (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({
      success: false,
      error: 'Please provide a date'
    });
  }
  
  // Get all appointments for this doctor on this date
  const appointments = await Appointment.find({
    doctor: req.params.doctorId,
    appointmentDate: new Date(date),
    status: { $nin: ['cancelled', 'completed'] }
  }).select('startTime endTime');
  
  // Define working hours (9 AM to 5 PM)
  const workingHours = {
    start: '09:00',
    end: '17:00'
  };
  
  // Generate all possible slots (30-minute intervals)
  const allSlots = [];
  let currentTime = workingHours.start;
  
  while (currentTime < workingHours.end) {
    const [hours, minutes] = currentTime.split(':');
    const nextHours = minutes === '30' ? String(parseInt(hours) + 1).padStart(2, '0') : hours;
    const nextMinutes = minutes === '30' ? '00' : '30';
    const endTime = `${nextHours}:${nextMinutes}`;
    
    allSlots.push({
      startTime: currentTime,
      endTime: endTime
    });
    
    currentTime = endTime;
  }
  
  // Filter out booked slots
  const availableSlots = allSlots.filter(slot => {
    return !appointments.some(apt => {
      return slot.startTime < apt.endTime && slot.endTime > apt.startTime;
    });
  });
  
  res.json({
    success: true,
    date,
    data: availableSlots
  });
}));

module.exports = router;

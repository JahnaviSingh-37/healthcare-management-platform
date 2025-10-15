import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  TextField,
  MenuItem,
  Avatar,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CalendarMonth,
  AccessTime,
  VideoCall,
  LocationOn,
  CheckCircle,
  Person,
  LocalHospital,
  Schedule,
  Favorite
} from '@mui/icons-material';
import axios from 'axios';

const AppointmentScheduler = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [appointmentType, setAppointmentType] = useState('in-person');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const steps = ['Select Doctor', 'Choose Date & Time', 'Appointment Details', 'Confirmation'];

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/users?role=doctor', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/v1/appointments/available-slots/${selectedDoctor._id}?date=${selectedDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAvailableSlots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleBookAppointment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/v1/appointments',
        {
          doctorId: selectedDoctor._id,
          appointmentDate: selectedDate,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          type: appointmentType,
          reason,
          symptoms: symptoms.split(',').map(s => s.trim())
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setActiveStep(3);
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
    setLoading(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { x: -20, opacity: 0 },
    visible: { x: 0, opacity: 1 }
  };

  const floatingVariants = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Animated Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <motion.div variants={floatingVariants} animate="float">
            <CalendarMonth sx={{ fontSize: 50, color: 'primary.main' }} />
          </motion.div>
          <Typography variant="h3" fontWeight="bold" color="primary">
            Book an Appointment
          </Typography>
        </Box>
      </motion.div>

      {/* Stepper */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Stepper activeStep={activeStep}>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {label}
                  </motion.div>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </motion.div>

      <AnimatePresence mode="wait">
        {/* Step 1: Select Doctor */}
        {activeStep === 0 && (
          <motion.div
            key="step1"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" mb={3} fontWeight="bold">
                Choose Your Doctor
              </Typography>
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                <Grid container spacing={3}>
                  {doctors.map((doctor, index) => (
                    <Grid item xs={12} md={6} key={doctor._id}>
                      <motion.div
                        variants={itemVariants}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          elevation={selectedDoctor?._id === doctor._id ? 8 : 2}
                          onClick={() => setSelectedDoctor(doctor)}
                          sx={{
                            cursor: 'pointer',
                            borderRadius: 3,
                            border: selectedDoctor?._id === doctor._id ? 3 : 0,
                            borderColor: 'primary.main',
                            transition: 'all 0.3s',
                            background: selectedDoctor?._id === doctor._id
                              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                              : 'white',
                            color: selectedDoctor?._id === doctor._id ? 'white' : 'inherit'
                          }}
                        >
                          <CardContent>
                            <Box display="flex" alignItems="center" gap={2}>
                              <motion.div
                                animate={{
                                  rotate: selectedDoctor?._id === doctor._id ? [0, 360] : 0
                                }}
                                transition={{ duration: 0.5 }}
                              >
                                <Avatar
                                  sx={{
                                    width: 70,
                                    height: 70,
                                    bgcolor: 'primary.main',
                                    fontSize: 28
                                  }}
                                >
                                  {doctor.firstName[0]}{doctor.lastName[0]}
                                </Avatar>
                              </motion.div>
                              <Box flex={1}>
                                <Typography variant="h6" fontWeight="bold" color="inherit">
                                  Dr. {doctor.firstName} {doctor.lastName}
                                </Typography>
                                <Typography variant="body2" color="inherit" sx={{ opacity: 0.9 }}>
                                  {doctor.specialization || 'General Practitioner'}
                                </Typography>
                                <Box mt={1}>
                                  <Chip
                                    icon={<LocalHospital />}
                                    label={doctor.licenseNumber || 'Licensed'}
                                    size="small"
                                    sx={{
                                      bgcolor: selectedDoctor?._id === doctor._id
                                        ? 'rgba(255,255,255,0.3)'
                                        : 'primary.light'
                                    }}
                                  />
                                </Box>
                              </Box>
                              {selectedDoctor?._id === doctor._id && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: 'spring' }}
                                >
                                  <CheckCircle sx={{ fontSize: 40 }} />
                                </motion.div>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
              <Box mt={4} display="flex" justifyContent="flex-end">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setActiveStep(1)}
                    disabled={!selectedDoctor}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Next
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* Step 2: Select Date & Time */}
        {activeStep === 1 && (
          <motion.div
            key="step2"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
          >
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" mb={3} fontWeight="bold">
                Select Date & Time
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Appointment Date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: getTodayDate() }}
                  />
                </Grid>
              </Grid>

              {selectedDate && availableSlots.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box mt={4}>
                    <Typography variant="h6" mb={2}>
                      Available Time Slots
                    </Typography>
                    <Grid container spacing={2}>
                      {availableSlots.map((slot, index) => (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button
                              fullWidth
                              variant={selectedSlot?.startTime === slot.startTime ? 'contained' : 'outlined'}
                              onClick={() => setSelectedSlot(slot)}
                              startIcon={<AccessTime />}
                              sx={{ borderRadius: 2, py: 1.5 }}
                            >
                              {slot.startTime}
                            </Button>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </motion.div>
              )}

              <Box mt={4} display="flex" justifyContent="space-between">
                <Button onClick={() => setActiveStep(0)} sx={{ borderRadius: 2 }}>
                  Back
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => setActiveStep(2)}
                    disabled={!selectedSlot}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    Next
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* Step 3: Appointment Details */}
        {activeStep === 2 && (
          <motion.div
            key="step3"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
          >
            <Paper elevation={4} sx={{ p: 4, borderRadius: 3 }}>
              <Typography variant="h5" mb={3} fontWeight="bold">
                Appointment Details
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Appointment Type"
                    value={appointmentType}
                    onChange={(e) => setAppointmentType(e.target.value)}
                  >
                    <MenuItem value="in-person">
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationOn /> In-Person Visit
                      </Box>
                    </MenuItem>
                    <MenuItem value="telemedicine">
                      <Box display="flex" alignItems="center" gap={1}>
                        <VideoCall /> Telemedicine (Video Call)
                      </Box>
                    </MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason for Visit"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    multiline
                    rows={3}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Symptoms (comma-separated)"
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="e.g., fever, cough, headache"
                  />
                </Grid>
              </Grid>

              <Box mt={4} display="flex" justifyContent="space-between">
                <Button onClick={() => setActiveStep(1)} sx={{ borderRadius: 2 }}>
                  Back
                </Button>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleBookAppointment}
                    disabled={!reason || loading}
                    sx={{ borderRadius: 2, px: 4 }}
                  >
                    {loading ? 'Booking...' : 'Book Appointment'}
                  </Button>
                </motion.div>
              </Box>
            </Paper>
          </motion.div>
        )}

        {/* Step 4: Success */}
        {activeStep === 3 && success && (
          <motion.div
            key="step4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring' }}
          >
            <Paper
              elevation={6}
              sx={{
                p: 6,
                borderRadius: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white'
              }}
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360]
                }}
                transition={{ duration: 1 }}
              >
                <CheckCircle sx={{ fontSize: 100, mb: 2 }} />
              </motion.div>
              <Typography variant="h3" fontWeight="bold" mb={2}>
                Appointment Booked!
              </Typography>
              <Typography variant="h6" mb={4}>
                Your appointment has been successfully scheduled
              </Typography>
              <Box bgcolor="rgba(255,255,255,0.2)" p={3} borderRadius={2} mb={4}>
                <Typography variant="body1" mb={1}>
                  <strong>Doctor:</strong> Dr. {selectedDoctor?.firstName} {selectedDoctor?.lastName}
                </Typography>
                <Typography variant="body1" mb={1}>
                  <strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}
                </Typography>
                <Typography variant="body1" mb={1}>
                  <strong>Time:</strong> {selectedSlot?.startTime}
                </Typography>
                <Typography variant="body1">
                  <strong>Type:</strong> {appointmentType}
                </Typography>
              </Box>
              <Button
                variant="contained"
                size="large"
                onClick={() => window.location.href = '/appointments'}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
                  borderRadius: 2,
                  px: 4
                }}
              >
                View My Appointments
              </Button>
            </Paper>
          </motion.div>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default AppointmentScheduler;

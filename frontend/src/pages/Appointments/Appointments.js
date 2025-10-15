import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Rating
} from '@mui/material';
import {
  CalendarMonth,
  VideoCall,
  LocationOn,
  Person,
  AccessTime,
  Cancel,
  Edit,
  Star,
  Favorite,
  CheckCircle,
  Schedule
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelDialog, setCancelDialog] = useState(false);
  const [ratingDialog, setRatingDialog] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5001/api/v1/appointments/${selectedAppointment._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason: 'Cancelled by patient' }
        }
      );
      fetchAppointments();
      setCancelDialog(false);
    } catch (error) {
      console.error('Error cancelling appointment:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'info',
      confirmed: 'success',
      completed: 'default',
      cancelled: 'error',
      'no-show': 'warning'
    };
    return colors[status] || 'default';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  const upcomingAppointments = appointments.filter(apt => 
    ['scheduled', 'confirmed'].includes(apt.status)
  );
  
  const pastAppointments = appointments.filter(apt => 
    ['completed', 'cancelled', 'no-show'].includes(apt.status)
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Schedule sx={{ fontSize: 60, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <CalendarMonth sx={{ fontSize: 50, color: 'primary.main' }} />
            </motion.div>
            <Typography variant="h3" fontWeight="bold" color="primary">
              My Appointments
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<CalendarMonth />}
              onClick={() => navigate('/appointments/schedule')}
              sx={{ borderRadius: 3 }}
            >
              Book New Appointment
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2} color="primary.dark">
            Upcoming Appointments
          </Typography>
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <Grid container spacing={3} mb={4}>
              {upcomingAppointments.map((appointment) => (
                <Grid item xs={12} md={6} key={appointment._id}>
                  <motion.div
                    variants={cardVariants}
                    whileHover={{ scale: 1.03, rotate: 1 }}
                  >
                    <Card
                      elevation={6}
                      sx={{
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        color: 'white',
                        position: 'relative',
                        overflow: 'hidden'
                      }}
                    >
                      {/* Animated Background */}
                      <motion.div
                        style={{
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 200,
                          height: 200,
                          opacity: 0.1
                        }}
                        animate={{
                          rotate: 360,
                          transition: { duration: 20, repeat: Infinity, ease: 'linear' }
                        }}
                      >
                        <Favorite sx={{ fontSize: 200 }} />
                      </motion.div>

                      <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        {/* Header */}
                        <Box display="flex" justifyContent="space-between" mb={2}>
                          <Chip
                            label={appointment.status}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                          <Typography variant="body2">
                            {appointment.appointmentId}
                          </Typography>
                        </Box>

                        {/* Doctor Info */}
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Avatar sx={{ width: 60, height: 60, bgcolor: 'rgba(255,255,255,0.3)' }}>
                            <Person sx={{ fontSize: 35 }} />
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.9 }}>
                              {appointment.doctor?.specialization}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Date & Time */}
                        <Box display="flex" gap={2} mb={2}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CalendarMonth />
                            <Typography>
                              {new Date(appointment.appointmentDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTime />
                            <Typography>{appointment.startTime}</Typography>
                          </Box>
                        </Box>

                        {/* Type */}
                        <Box display="flex" alignItems="center" gap={1} mb={3}>
                          {appointment.type === 'telemedicine' ? <VideoCall /> : <LocationOn />}
                          <Typography>
                            {appointment.type === 'telemedicine' ? 'Video Call' : 'In-Person Visit'}
                          </Typography>
                        </Box>

                        {/* Actions */}
                        <Box display="flex" gap={1}>
                          {appointment.type === 'telemedicine' && (
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                variant="contained"
                                startIcon={<VideoCall />}
                                sx={{
                                  bgcolor: 'rgba(255,255,255,0.3)',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)' }
                                }}
                              >
                                Join Call
                              </Button>
                            </motion.div>
                          )}
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <IconButton
                              sx={{ color: 'white' }}
                              onClick={() => {
                                setSelectedAppointment(appointment);
                                setCancelDialog(true);
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </motion.div>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      )}

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Typography variant="h5" fontWeight="bold" mb={2} color="text.secondary">
            Past Appointments
          </Typography>
          <Grid container spacing={3}>
            {pastAppointments.map((appointment) => (
              <Grid item xs={12} md={6} key={appointment._id}>
                <motion.div whileHover={{ scale: 1.02 }}>
                  <Card elevation={2} sx={{ borderRadius: 3, opacity: 0.8 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" mb={2}>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(appointment.appointmentDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography variant="h6" mb={1}>
                        Dr. {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </Typography>
                      {appointment.status === 'completed' && !appointment.rating && (
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outlined"
                            startIcon={<Star />}
                            size="small"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setRatingDialog(true);
                            }}
                          >
                            Rate Appointment
                          </Button>
                        </motion.div>
                      )}
                      {appointment.rating && (
                        <Box display="flex" alignItems="center" gap={1}>
                          <Rating value={appointment.rating} readOnly size="small" />
                          <Typography variant="body2" color="text.secondary">
                            Your Rating
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Cancel Dialog */}
      <Dialog open={cancelDialog} onClose={() => setCancelDialog(false)}>
        <DialogTitle>Cancel Appointment</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to cancel this appointment?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialog(false)}>No, Keep It</Button>
          <Button onClick={handleCancel} color="error" variant="contained">
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={ratingDialog} onClose={() => setRatingDialog(false)}>
        <DialogTitle>Rate Your Appointment</DialogTitle>
        <DialogContent>
          <Box py={2}>
            <Typography mb={2}>How was your experience?</Typography>
            <Rating
              value={rating}
              onChange={(e, newValue) => setRating(newValue)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Feedback (optional)"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRatingDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={rating === 0}>
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Appointments;

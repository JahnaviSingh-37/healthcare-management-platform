import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Button,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Medication as MedicationIcon,
  Event as EventIcon,
  Favorite as FavoriteIcon,
  LocalHospital as HospitalIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EnhancedDashboard.css';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const EnhancedDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    appointments: 0,
    prescriptions: 0,
    vitals: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [appointmentsRes, prescriptionsRes, notificationsRes] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/v1/prescriptions', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5001/api/v1/notifications/unread-count', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setStats({
        appointments: appointmentsRes.data.count || 0,
        prescriptions: prescriptionsRes.data.count || 0,
        vitals: 12, // Mock data
        notifications: notificationsRes.data.data.count || 0
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch dashboard data');
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Appointments',
      value: stats.appointments,
      icon: <EventIcon />,
      color: '#667eea',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      action: () => navigate('/appointments')
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: <MedicationIcon />,
      color: '#f093fb',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      action: () => navigate('/prescriptions')
    },
    {
      title: 'Vitals Recorded',
      value: stats.vitals,
      icon: <FavoriteIcon />,
      color: '#4facfe',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      action: () => navigate('/vitals')
    },
    {
      title: 'Notifications',
      value: stats.notifications,
      icon: <NotificationsIcon />,
      color: '#fa709a',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      action: () => navigate('/dashboard')
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Welcome Header */}
      <MotionBox
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Welcome back, {user.firstName}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Here's what's happening with your health today
        </Typography>
      </MotionBox>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <Grid container spacing={3}>
          {statCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <MotionCard
                variants={cardVariants}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={stat.action}
                sx={{
                  background: stat.gradient,
                  color: 'white',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  height: '160px'
                }}
              >
                {/* Animated Background Circle */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }}
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: 360
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {React.cloneElement(stat.icon, { sx: { fontSize: 60, opacity: 0.3 } })}
                  </motion.div>
                </Box>

                <CardContent sx={{ position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Avatar
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.2)',
                        width: 50,
                        height: 50,
                        mb: 2
                      }}
                    >
                      {stat.icon}
                    </Avatar>
                  </Box>
                  
                  <Box>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                    >
                      <Typography variant="h3" fontWeight="bold">
                        {stat.value}
                      </Typography>
                    </motion.div>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Quick Actions */}
      <MotionBox
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        sx={{ mt: 4 }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          ⚡ Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<EventIcon />}
                onClick={() => navigate('/appointments')}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  py: 2
                }}
              >
                Book Appointment
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<MedicationIcon />}
                onClick={() => navigate('/prescriptions')}
                sx={{
                  background: 'linear-gradient(45deg, #f093fb 30%, #f5576c 90%)',
                  py: 2
                }}
              >
                View Prescriptions
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<FavoriteIcon />}
                onClick={() => navigate('/vitals')}
                sx={{
                  background: 'linear-gradient(45deg, #4facfe 30%, #00f2fe 90%)',
                  py: 2
                }}
              >
                Record Vitals
              </Button>
            </motion.div>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<HospitalIcon />}
                onClick={() => navigate('/health-records')}
                sx={{
                  background: 'linear-gradient(45deg, #fa709a 30%, #fee140 90%)',
                  py: 2
                }}
              >
                Health Records
              </Button>
            </motion.div>
          </Grid>
        </Grid>
      </MotionBox>

      {/* Health Status Card */}
      <MotionBox
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        sx={{ mt: 4 }}
      >
        <Card
          sx={{
            background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  💪 Your Health Score
                </Typography>
                <Typography variant="h2" fontWeight="bold" color="primary">
                  85/100
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Great! Keep up the good work
                </Typography>
              </Box>
              <motion.div
                animate={{
                  y: [0, -20, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 120, color: 'primary.main', opacity: 0.3 }} />
              </motion.div>
            </Box>
          </CardContent>
        </Card>
      </MotionBox>
    </Box>
  );
};

export default EnhancedDashboard;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Typography,
  Box,
  Grid,
  Paper,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip
} from '@mui/material';
import {
  CalendarMonth,
  LocalPharmacy,
  MonitorHeart,
  MedicalServices,
  Favorite
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    healthRecords: 0,
    vitals: 0,
    appointments: 0,
    prescriptions: 0,
    notifications: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch all stats in parallel
      const [records, vitals, appointments, prescriptions, notifications] = await Promise.all([
        axios.get('http://localhost:5001/api/v1/health-records', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5001/api/v1/vitals', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5001/api/v1/appointments', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5001/api/v1/prescriptions', { headers }).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5001/api/v1/notifications/unread-count', { headers }).catch(() => ({ data: { count: 0 } }))
      ]);

      setStats({
        healthRecords: records.data.data?.length || records.data.count || 0,
        vitals: vitals.data.data?.length || vitals.data.count || 0,
        appointments: appointments.data.data?.length || appointments.data.count || 0,
        prescriptions: prescriptions.data.data?.length || prescriptions.data.count || 0,
        notifications: notifications.data.count || 0
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
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

  const statCards = [
    {
      title: 'Health Records',
      value: stats.healthRecords,
      icon: <MedicalServices sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: '/health-records'
    },
    {
      title: 'Vitals Recorded',
      value: stats.vitals,
      icon: <MonitorHeart sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: '/vitals'
    },
    {
      title: 'Appointments',
      value: stats.appointments,
      icon: <CalendarMonth sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: '/appointments'
    },
    {
      title: 'Prescriptions',
      value: stats.prescriptions,
      icon: <LocalPharmacy sx={{ fontSize: 40 }} />,
      color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: '/prescriptions'
    }
  ];

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box mb={4}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Welcome back, {user?.firstName}! 👋
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Chip 
              label={user?.role?.toUpperCase()} 
              color="primary" 
              size="medium"
              icon={<Favorite />}
            />
            <Typography variant="body1" color="text.secondary">
              Here's what's happening with your health today
            </Typography>
          </Box>
        </Box>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3} mb={4}>
          {statCards.map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <motion.div
                variants={cardVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card
                  onClick={() => navigate(card.path)}
                  sx={{
                    cursor: 'pointer',
                    background: card.color,
                    color: 'white',
                    borderRadius: 3,
                    boxShadow: 4,
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: 8
                    }
                  }}
                >
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Box>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 1 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="h3" fontWeight="bold">
                          {loading ? '...' : card.value}
                        </Typography>
                      </Box>
                      <motion.div
                        animate={{
                          rotate: [0, 10, -10, 0],
                          scale: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: 'easeInOut'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 70,
                            height: 70,
                            bgcolor: 'rgba(255,255,255,0.3)'
                          }}
                        >
                          {card.icon}
                        </Avatar>
                      </motion.div>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Paper 
          sx={{ 
            p: 4, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3} color="primary.main">
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<CalendarMonth />}
                  onClick={() => navigate('/appointments/schedule')}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  Book Appointment
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MedicalServices />}
                  onClick={() => navigate('/health-records')}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  View Records
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MonitorHeart />}
                  onClick={() => navigate('/vitals')}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  Record Vitals
                </Button>
              </motion.div>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<LocalPharmacy />}
                  onClick={() => navigate('/prescriptions')}
                  sx={{ 
                    py: 2, 
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    boxShadow: 3,
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  Prescriptions
                </Button>
              </motion.div>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>
    </Box>
  );
};

export default Dashboard;

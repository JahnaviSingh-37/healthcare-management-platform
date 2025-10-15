import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  IconButton,
  Grid,
  TextField,
  InputAdornment,
  Fade,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocalHospital,
  Search,
  FilterList,
  Print,
  Download,
  Visibility,
  Medication,
  Schedule,
  Person,
  LocalPharmacy
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PrescriptionList = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    },
    hover: {
      y: -8,
      boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
      transition: {
        type: 'spring',
        stiffness: 300
      }
    }
  };

  const pulseVariants = {
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = rx.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rx.doctor?.firstName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || rx.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <LocalHospital sx={{ fontSize: 60, color: 'primary.main' }} />
        </motion.div>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header with animated title */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={4}>
          <motion.div
            animate={{
              rotate: [0, -10, 10, -10, 0],
              transition: { duration: 2, repeat: Infinity }
            }}
          >
            <Medication sx={{ fontSize: 40, color: 'primary.main' }} />
          </motion.div>
          <Typography variant="h3" fontWeight="bold" color="primary">
            My Prescriptions
          </Typography>
        </Box>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Paper elevation={3} sx={{ p: 3, mb: 4, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by diagnosis or doctor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box display="flex" gap={1}>
                {['all', 'active', 'completed', 'cancelled'].map((status) => (
                  <motion.div key={status} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Chip
                      label={status.charAt(0).toUpperCase() + status.slice(1)}
                      onClick={() => setFilter(status)}
                      color={filter === status ? 'primary' : 'default'}
                      variant={filter === status ? 'filled' : 'outlined'}
                    />
                  </motion.div>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </motion.div>

      {/* Prescriptions Grid */}
      {filteredPrescriptions.length === 0 ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring' }}
        >
          <Alert severity="info" sx={{ borderRadius: 3, fontSize: 18 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <LocalPharmacy sx={{ fontSize: 40 }} />
              <Typography>No prescriptions found matching your criteria.</Typography>
            </Box>
          </Alert>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {filteredPrescriptions.map((prescription, index) => (
              <Grid item xs={12} md={6} key={prescription._id}>
                <motion.div
                  variants={cardVariants}
                  whileHover="hover"
                  custom={index}
                >
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white'
                    }}
                  >
                    {/* Animated Background Pattern */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: 150,
                        height: 150,
                        opacity: 0.1
                      }}
                      animate={{
                        rotate: 360,
                        transition: { duration: 20, repeat: Infinity, ease: 'linear' }
                      }}
                    >
                      <LocalHospital sx={{ fontSize: 150 }} />
                    </motion.div>

                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box>
                          <Typography variant="h6" fontWeight="bold">
                            {prescription.prescriptionId}
                          </Typography>
                          <Typography variant="body2" sx={{ opacity: 0.9 }}>
                            {new Date(prescription.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <motion.div variants={pulseVariants} animate="pulse">
                          <Chip
                            label={prescription.status}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.3)',
                              color: 'white',
                              fontWeight: 'bold'
                            }}
                          />
                        </motion.div>
                      </Box>

                      {/* Doctor Info */}
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <Person />
                        <Typography>
                          Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                        </Typography>
                      </Box>

                      {/* Diagnosis */}
                      <Box mb={2}>
                        <Typography variant="body2" fontWeight="bold" mb={0.5}>
                          Diagnosis:
                        </Typography>
                        <Typography variant="body1">
                          {prescription.diagnosis}
                        </Typography>
                      </Box>

                      {/* Medications Count */}
                      <Box display="flex" alignItems="center" gap={1} mb={3}>
                        <Medication />
                        <Typography>
                          {prescription.medications?.length || 0} Medication(s)
                        </Typography>
                      </Box>

                      {/* Action Buttons */}
                      <Box display="flex" gap={1}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            startIcon={<Visibility />}
                            onClick={() => navigate(`/prescriptions/${prescription._id}`)}
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.2)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' }
                            }}
                          >
                            View Details
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: 'white' }}>
                            <Print />
                          </IconButton>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton sx={{ color: 'white' }}>
                            <Download />
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
      )}
    </Container>
  );
};

export default PrescriptionList;

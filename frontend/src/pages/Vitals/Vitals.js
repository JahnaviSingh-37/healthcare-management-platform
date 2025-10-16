import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  MonitorHeart,
  Favorite,
  Thermostat,
  Speed,
  Height,
  FitnessCenter,
  Add,
  Warning
} from '@mui/icons-material';
import axios from 'axios';
import { useSelector } from 'react-redux';

const Vitals = () => {
  const { user } = useSelector((state) => state.auth);
  const [vitals, setVitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newVital, setNewVital] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    weight: '',
    height: '',
    oxygenSaturation: '',
    notes: ''
  });

  useEffect(() => {
    fetchVitals();
  }, []);

  const fetchVitals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/vitals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVitals(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching vitals:', error);
      setLoading(false);
    }
  };

  const handleAddVital = async () => {
    try {
      setError('');
      setSuccess('');
      const token = localStorage.getItem('token');
      
      // Validate that at least one vital is provided
      if (!newVital.heartRate && !newVital.systolic && !newVital.temperature && 
          !newVital.weight && !newVital.height && !newVital.oxygenSaturation) {
        setError('Please enter at least one vital measurement');
        return;
      }
      
      const vitalData = {
        patient: user._id,
        heartRate: newVital.heartRate ? { value: parseFloat(newVital.heartRate), unit: 'bpm' } : undefined,
        bloodPressure: (newVital.systolic && newVital.diastolic) ? {
          systolic: parseFloat(newVital.systolic),
          diastolic: parseFloat(newVital.diastolic),
          unit: 'mmHg'
        } : undefined,
        temperature: newVital.temperature ? { value: parseFloat(newVital.temperature), unit: 'fahrenheit' } : undefined,
        weight: newVital.weight ? { value: parseFloat(newVital.weight), unit: 'lbs' } : undefined,
        height: newVital.height ? { value: parseFloat(newVital.height), unit: 'inches' } : undefined,
        oxygenSaturation: newVital.oxygenSaturation ? { value: parseFloat(newVital.oxygenSaturation), unit: '%' } : undefined,
        notes: newVital.notes,
        recordDate: new Date()
      };

      console.log('Sending vital data:', vitalData);

      const response = await axios.post('http://localhost:5001/api/v1/vitals', vitalData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('Vitals saved successfully:', response.data);
      setSuccess('Vitals recorded successfully!');
      await fetchVitals();
      setOpenDialog(false);
      setNewVital({
        heartRate: '',
        systolic: '',
        diastolic: '',
        temperature: '',
        weight: '',
        height: '',
        oxygenSaturation: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding vital:', error);
      console.error('Error response:', error.response?.data);
      setError(error.response?.data?.error || 'Failed to add vitals. Please try again.');
    }
  };

  const getVitalIcon = (type) => {
    const icons = {
      heartRate: <Favorite sx={{ color: '#f5576c' }} />,
      bloodPressure: <Speed sx={{ color: '#667eea' }} />,
      temperature: <Thermostat sx={{ color: '#fa709a' }} />,
      weight: <FitnessCenter sx={{ color: '#43e97b' }} />,
      height: <Height sx={{ color: '#4facfe' }} />,
      oxygen: <MonitorHeart sx={{ color: '#f093fb' }} />
    };
    return icons[type] || <MonitorHeart />;
  };

  const isAbnormal = (vital) => {
    if (vital.heartRate?.value) {
      const hr = vital.heartRate.value;
      if (hr < 60 || hr > 100) return true;
    }
    if (vital.bloodPressure?.systolic) {
      const bp = vital.bloodPressure.systolic;
      if (bp >= 140 || bp < 90) return true;
    }
    return false;
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            >
              <MonitorHeart sx={{ fontSize: 50, color: 'primary.main' }} />
            </motion.div>
            <Typography variant="h3" fontWeight="bold" color="primary">
              Vitals Monitoring
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setOpenDialog(true)}
              sx={{ borderRadius: 2, px: 3 }}
            >
              Record Vitals
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Empty State */}
      {vitals.length === 0 ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <MonitorHeart sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" gutterBottom color="text.secondary">
              No Vitals Recorded Yet
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {user?.role === 'patient' 
                ? 'Your healthcare provider will record your vitals during appointments.'
                : 'Start recording patient vitals to track their health over time.'}
            </Typography>
            {user?.role !== 'patient' && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenDialog(true)}
                sx={{ mt: 2, borderRadius: 2 }}
              >
                Record First Vital
              </Button>
            )}
          </Paper>
        </motion.div>
      ) : (
        /* Vitals List */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <Grid container spacing={3}>
            {vitals.map((vital, index) => (
              <Grid item xs={12} key={vital._id || index}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card
                    sx={{
                      borderRadius: 3,
                      boxShadow: 3,
                      border: isAbnormal(vital) ? 2 : 0,
                      borderColor: 'warning.main',
                      transition: 'all 0.3s'
                    }}
                  >
                    <CardContent>
                      <Grid container spacing={2}>
                        {/* Date & Status */}
                        <Grid item xs={12}>
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography variant="h6" fontWeight="bold">
                              {new Date(vital.recordDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </Typography>
                            {isAbnormal(vital) && (
                              <Chip
                                icon={<Warning />}
                                label="Abnormal Values"
                                color="warning"
                                size="small"
                              />
                            )}
                          </Box>
                        </Grid>

                        {/* Vital Signs */}
                        {vital.heartRate?.value && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('heartRate')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Heart Rate
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.heartRate.value} bpm
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.bloodPressure?.systolic && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('bloodPressure')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Blood Pressure
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.bloodPressure.systolic}/{vital.bloodPressure.diastolic}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.temperature?.value && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('temperature')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Temperature
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.temperature.value}°F
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.weight?.value && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('weight')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Weight
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.weight.value} lbs
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.height?.value && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('height')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Height
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.height.value}"
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.oxygenSaturation?.value && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              {getVitalIcon('oxygen')}
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                Oxygen
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.oxygenSaturation.value}%
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.bmi && (
                          <Grid item xs={6} sm={4} md={2}>
                            <Box textAlign="center">
                              <FitnessCenter sx={{ color: '#43e97b' }} />
                              <Typography variant="body2" color="text.secondary" mt={1}>
                                BMI
                              </Typography>
                              <Typography variant="h6" fontWeight="bold">
                                {vital.bmi}
                              </Typography>
                            </Box>
                          </Grid>
                        )}

                        {vital.notes && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              <strong>Notes:</strong> {vital.notes}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {/* Add Vital Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={2}>
            <MonitorHeart color="primary" />
            <Typography variant="h5" fontWeight="bold">
              Record New Vitals
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Heart Rate (bpm)"
                type="number"
                value={newVital.heartRate}
                onChange={(e) => setNewVital({ ...newVital, heartRate: e.target.value })}
                placeholder="70"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Systolic BP"
                type="number"
                value={newVital.systolic}
                onChange={(e) => setNewVital({ ...newVital, systolic: e.target.value })}
                placeholder="120"
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                fullWidth
                label="Diastolic BP"
                type="number"
                value={newVital.diastolic}
                onChange={(e) => setNewVital({ ...newVital, diastolic: e.target.value })}
                placeholder="80"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Temperature (°F)"
                type="number"
                value={newVital.temperature}
                onChange={(e) => setNewVital({ ...newVital, temperature: e.target.value })}
                placeholder="98.6"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Oxygen Saturation (%)"
                type="number"
                value={newVital.oxygenSaturation}
                onChange={(e) => setNewVital({ ...newVital, oxygenSaturation: e.target.value })}
                placeholder="98"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Weight (lbs)"
                type="number"
                value={newVital.weight}
                onChange={(e) => setNewVital({ ...newVital, weight: e.target.value })}
                placeholder="150"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Height (inches)"
                type="number"
                value={newVital.height}
                onChange={(e) => setNewVital({ ...newVital, height: e.target.value })}
                placeholder="68"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={newVital.notes}
                onChange={(e) => setNewVital({ ...newVital, notes: e.target.value })}
                placeholder="Additional observations or notes..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddVital}
            disabled={!newVital.heartRate && !newVital.systolic && !newVital.temperature}
            sx={{ borderRadius: 2 }}
          >
            Record Vitals
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSuccess('')} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Vitals;

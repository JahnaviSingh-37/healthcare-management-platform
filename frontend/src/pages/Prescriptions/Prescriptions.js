import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Fade,
  Slide,
  Zoom,
  Fab,
  Tooltip,
  IconButton,
  Divider,
  Avatar
} from '@mui/material';
import {
  Add as AddIcon,
  LocalHospital as PrescriptionIcon,
  Calendar as CalendarIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  CheckCircle as CheckCircleIcon,
  Medication as MedicationIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Prescriptions.css';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5001/api/v1/prescriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPrescriptions(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load prescriptions');
      setLoading(false);
    }
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPrescription(null);
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
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="80vh"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <MedicationIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        </motion.div>
        <Typography variant="h6" color="textSecondary">
          Loading Prescriptions...
        </Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with Animation */}
      <MotionBox
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mr: 2 }}>
              <PrescriptionIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                📋 My Prescriptions
              </Typography>
              <Typography variant="body2" color="textSecondary">
                View and manage your medical prescriptions
              </Typography>
            </Box>
          </Box>
        </Box>
      </MotionBox>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <Fade in>
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
              {error}
            </Alert>
          </Fade>
        )}
        {success && (
          <Fade in>
            <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          </Fade>
        )}
      </AnimatePresence>

      {/* Prescriptions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Grid container spacing={3}>
          {prescriptions.length === 0 ? (
            <Grid item xs={12}>
              <MotionCard
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 100 }}
              >
                <CardContent sx={{ textAlign: 'center', py: 8 }}>
                  <motion.div
                    animate={{
                      y: [0, -20, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <PrescriptionIcon sx={{ fontSize: 100, color: 'text.disabled', mb: 2 }} />
                  </motion.div>
                  <Typography variant="h5" color="textSecondary" gutterBottom>
                    No Prescriptions Yet
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Your prescriptions will appear here when your doctor creates them.
                  </Typography>
                </CardContent>
              </MotionCard>
            </Grid>
          ) : (
            prescriptions.map((prescription, index) => (
              <Grid item xs={12} md={6} key={prescription._id}>
                <MotionCard
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.03,
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    transition: { duration: 0.3 }
                  }}
                  sx={{
                    cursor: 'pointer',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onClick={() => handleViewDetails(prescription)}
                >
                  {/* Animated Background Pattern */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: '200px',
                      height: '200px',
                      opacity: 0.1
                    }}
                  >
                    <motion.div
                      animate={{
                        rotate: 360,
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                    >
                      <MedicationIcon sx={{ fontSize: 200 }} />
                    </motion.div>
                  </Box>

                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                      <Typography variant="h6" fontWeight="bold">
                        {prescription.prescriptionId}
                      </Typography>
                      <Chip
                        label={prescription.status}
                        color={getStatusColor(prescription.status)}
                        size="small"
                        sx={{ fontWeight: 'bold' }}
                      />
                    </Box>

                    <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)', my: 2 }} />

                    <Box display="flex" alignItems="center" mb={1}>
                      <PersonIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        Dr. {prescription.doctor?.firstName} {prescription.doctor?.lastName}
                      </Typography>
                    </Box>

                    <Box display="flex" alignItems="center" mb={2}>
                      <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {new Date(prescription.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                      <strong>Diagnosis:</strong> {prescription.diagnosis}
                    </Typography>

                    <Box display="flex" alignItems="center">
                      <MedicationIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" fontWeight="bold">
                        {prescription.medications?.length || 0} Medication(s)
                      </Typography>
                    </Box>
                  </CardContent>
                </MotionCard>
              </Grid>
            ))
          )}
        </Grid>
      </motion.div>

      {/* Prescription Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
      >
        {selectedPrescription && (
          <>
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6" fontWeight="bold">
                  📋 Prescription Details
                </Typography>
                <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}>
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Alert severity="info" icon={<CheckCircleIcon />}>
                    Prescription ID: <strong>{selectedPrescription.prescriptionId}</strong>
                  </Alert>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Doctor
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    Dr. {selectedPrescription.doctor?.firstName} {selectedPrescription.doctor?.lastName}
                  </Typography>
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Date Issued
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {new Date(selectedPrescription.createdAt).toLocaleDateString()}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Diagnosis
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedPrescription.diagnosis}
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    💊 Medications
                  </Typography>
                  {selectedPrescription.medications?.map((med, idx) => (
                    <Card key={idx} sx={{ mb: 2, bgcolor: 'grey.50' }}>
                      <CardContent>
                        <Typography variant="subtitle1" fontWeight="bold" color="primary">
                          {idx + 1}. {med.name}
                        </Typography>
                        <Grid container spacing={1} sx={{ mt: 1 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Dosage: <strong>{med.dosage}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Frequency: <strong>{med.frequency}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Duration: <strong>{med.duration?.value} {med.duration?.unit}</strong>
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              Refills: <strong>{med.refills}</strong>
                            </Typography>
                          </Grid>
                          {med.instructions && (
                            <Grid item xs={12}>
                              <Typography variant="body2" color="textSecondary">
                                Instructions: <em>{med.instructions}</em>
                              </Typography>
                            </Grid>
                          )}
                        </Grid>
                      </CardContent>
                    </Card>
                  ))}
                </Grid>

                {selectedPrescription.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Additional Notes
                    </Typography>
                    <Typography variant="body2">
                      {selectedPrescription.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                startIcon={<DownloadIcon />}
                variant="outlined"
                color="primary"
              >
                Download
              </Button>
              <Button
                startIcon={<PrintIcon />}
                variant="contained"
                color="primary"
              >
                Print
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default Prescriptions;

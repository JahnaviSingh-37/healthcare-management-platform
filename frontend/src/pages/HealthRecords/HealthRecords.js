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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import {
  MedicalServices,
  Person,
  CalendarToday,
  Description,
  Add,
  Visibility,
  Download,
  LocalHospital,
  Science,
  Assignment,
  Close
} from '@mui/icons-material';
import axios from 'axios';

const HealthRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [newRecord, setNewRecord] = useState({
    recordType: 'consultation',
    diagnosis: '',
    symptoms: '',
    treatment: '',
    notes: ''
  });

  useEffect(() => {
    fetchHealthRecords();
  }, []);

  const fetchHealthRecords = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/v1/health-records', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRecords(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching health records:', error);
      setLoading(false);
    }
  };

  const handleAddRecord = async () => {
    try {
      const token = localStorage.getItem('token');
      const symptomsArray = newRecord.symptoms.split(',').map(s => s.trim()).filter(s => s);
      
      await axios.post(
        'http://localhost:5001/api/v1/health-records',
        {
          ...newRecord,
          symptoms: symptomsArray
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setOpenAddDialog(false);
      setNewRecord({
        recordType: 'consultation',
        diagnosis: '',
        symptoms: '',
        treatment: '',
        notes: ''
      });
      fetchHealthRecords();
    } catch (error) {
      console.error('Error adding health record:', error);
    }
  };

  const getRecordIcon = (type) => {
    switch (type) {
      case 'consultation': return <MedicalServices />;
      case 'lab_result': return <Science />;
      case 'procedure': return <Assignment />;
      case 'imaging': return <Description />;
      default: return <MedicalServices />;
    }
  };

  const getRecordColor = (type) => {
    switch (type) {
      case 'consultation': return '#667eea';
      case 'lab_result': return '#f093fb';
      case 'procedure': return '#4facfe';
      case 'imaging': return '#43e97b';
      default: return '#667eea';
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
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box display="flex" alignItems="center" gap={2}>
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                transition: { duration: 2, repeat: Infinity }
              }}
            >
              <MedicalServices sx={{ fontSize: 50, color: 'primary.main' }} />
            </motion.div>
            <Typography variant="h3" fontWeight="bold" color="primary">
              Health Records
            </Typography>
          </Box>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={() => setOpenAddDialog(true)}
              sx={{ borderRadius: 3 }}
            >
              Add New Record
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* Records Grid */}
      {records.length === 0 ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Alert severity="info" sx={{ borderRadius: 3, fontSize: 18 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <MedicalServices sx={{ fontSize: 40 }} />
              <Typography>No health records found. Add your first record to get started!</Typography>
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
            {records.map((record, index) => (
              <Grid item xs={12} md={6} key={record._id}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ scale: 1.02, y: -5 }}
                  custom={index}
                >
                  <Card
                    elevation={4}
                    sx={{
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '6px',
                        background: `linear-gradient(90deg, ${getRecordColor(record.recordType)}, ${getRecordColor(record.recordType)}dd)`
                      }
                    }}
                  >
                    <CardContent sx={{ pt: 3 }}>
                      {/* Header */}
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Avatar
                            sx={{
                              bgcolor: getRecordColor(record.recordType),
                              width: 56,
                              height: 56
                            }}
                          >
                            {getRecordIcon(record.recordType)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {record.diagnosis}
                            </Typography>
                            <Chip
                              label={record.recordType.replace('_', ' ')}
                              size="small"
                              sx={{
                                bgcolor: `${getRecordColor(record.recordType)}22`,
                                color: getRecordColor(record.recordType),
                                fontWeight: 'bold',
                                mt: 0.5
                              }}
                            />
                          </Box>
                        </Box>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton
                            onClick={() => {
                              setSelectedRecord(record);
                              setOpenDialog(true);
                            }}
                            sx={{ color: 'primary.main' }}
                          >
                            <Visibility />
                          </IconButton>
                        </motion.div>
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Doctor Info */}
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Person sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          Dr. {record.doctor?.firstName} {record.doctor?.lastName}
                        </Typography>
                      </Box>

                      {/* Date */}
                      <Box display="flex" alignItems="center" gap={1} mb={2}>
                        <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(record.recordDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Typography>
                      </Box>

                      {/* Symptoms Preview */}
                      {record.symptoms && record.symptoms.length > 0 && (
                        <Box mb={2}>
                          <Typography variant="body2" fontWeight="bold" color="text.secondary" mb={0.5}>
                            Symptoms:
                          </Typography>
                          <Box display="flex" flexWrap="wrap" gap={0.5}>
                            {record.symptoms.slice(0, 3).map((symptom, idx) => (
                              <Chip
                                key={idx}
                                label={symptom}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                            {record.symptoms.length > 3 && (
                              <Chip
                                label={`+${record.symptoms.length - 3} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box display="flex" gap={1} mt={2}>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} style={{ flex: 1 }}>
                          <Button
                            fullWidth
                            variant="contained"
                            startIcon={<Visibility />}
                            onClick={() => {
                              setSelectedRecord(record);
                              setOpenDialog(true);
                            }}
                            sx={{ borderRadius: 2 }}
                          >
                            View Full Record
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <IconButton
                            sx={{
                              border: '1px solid',
                              borderColor: 'primary.main',
                              color: 'primary.main'
                            }}
                          >
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

      {/* View Record Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedRecord && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: getRecordColor(selectedRecord.recordType) }}>
                    {getRecordIcon(selectedRecord.recordType)}
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight="bold">
                      {selectedRecord.diagnosis}
                    </Typography>
                    <Chip
                      label={selectedRecord.recordType.replace('_', ' ')}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
                <IconButton onClick={() => setOpenDialog(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Doctor
                    </Typography>
                    <Typography variant="h6">
                      Dr. {selectedRecord.doctor?.firstName} {selectedRecord.doctor?.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedRecord.doctor?.specialization}
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Date
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedRecord.recordDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Grid>

                {selectedRecord.symptoms && selectedRecord.symptoms.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Symptoms
                    </Typography>
                    <List dense>
                      {selectedRecord.symptoms.map((symptom, idx) => (
                        <ListItem key={idx}>
                          <ListItemText primary={`• ${symptom}`} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Treatment
                  </Typography>
                  <Typography variant="body1">{selectedRecord.treatment}</Typography>
                </Grid>

                {selectedRecord.notes && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Additional Notes
                    </Typography>
                    <Typography variant="body1">{selectedRecord.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenDialog(false)}>Close</Button>
              <Button variant="contained" startIcon={<Download />}>
                Download PDF
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Add Record Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold">
            Add New Health Record
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Record Type"
                value={newRecord.recordType}
                onChange={(e) => setNewRecord({ ...newRecord, recordType: e.target.value })}
              >
                <MenuItem value="consultation">Consultation</MenuItem>
                <MenuItem value="lab_result">Lab Result</MenuItem>
                <MenuItem value="procedure">Procedure</MenuItem>
                <MenuItem value="imaging">Imaging</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Diagnosis"
                value={newRecord.diagnosis}
                onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Symptoms (comma-separated)"
                value={newRecord.symptoms}
                onChange={(e) => setNewRecord({ ...newRecord, symptoms: e.target.value })}
                placeholder="e.g., fever, cough, headache"
                multiline
                rows={2}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Treatment"
                value={newRecord.treatment}
                onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                value={newRecord.notes}
                onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddRecord}
            disabled={!newRecord.diagnosis || !newRecord.treatment}
          >
            Add Record
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default HealthRecords;

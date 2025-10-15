import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  PersonAdd,
  Email,
  Lock,
  Person,
  Badge,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { register, setCredentials } from '../../store/slices/authSlice';
import OTPVerification from '../../components/OTPVerification';

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['patient', 'doctor', 'nurse', 'admin'], 'Invalid role')
    .required('Please select a role'),
  dateOfBirth: Yup.date()
    .required('Date of birth is required')
    .max(new Date(), 'Date of birth cannot be in the future'),
  phone: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other', 'prefer_not_to_say'], 'Please select a gender')
    .required('Gender is required'),
  licenseNumber: Yup.string().when('role', ([role], schema) => {
    if (role === 'doctor' || role === 'nurse') {
      return schema.required('License number is required for medical professionals');
    }
    return schema.notRequired();
  }),
  specialization: Yup.string().when('role', ([role], schema) => {
    if (role === 'doctor') {
      return schema.required('Specialization is required for doctors');
    }
    return schema.notRequired();
  }),
});

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { confirmPassword, name, ...rest } = values;
      
      // Split name into firstName and lastName
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || firstName;
      
      // Clean up data - only include licenseNumber and specialization if they exist
      const userData = {
        ...rest,
        firstName,
        lastName,
      };

      // Remove empty optional fields - but keep them if they have values
      if (!userData.licenseNumber || userData.licenseNumber.trim() === '') {
        delete userData.licenseNumber;
      }
      if (!userData.specialization || userData.specialization.trim() === '') {
        delete userData.specialization;
      }

      console.log('Submitting registration data:', userData);
      
      const result = await dispatch(register(userData));
      
      if (result.type === 'auth/register/fulfilled') {
        const payload = result.payload;
        
        // Check if OTP verification is required
        if (payload?.requiresOTP) {
          setRegisteredEmail(userData.email);
          setShowOTP(true);
        } else {
          // Registration successful with tokens - store credentials and navigate
          if (payload?.token && payload?.user) {
            dispatch(setCredentials({
              user: payload.user,
              token: payload.token
            }));
          }
          navigate('/dashboard');
        }
      } else if (result.type === 'auth/register/rejected') {
        setErrors({ submit: result.payload || 'Registration failed' });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'An unexpected error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOTPSuccess = (data) => {
    // Store user data in Redux
    dispatch(setCredentials({
      user: data.user,
      token: data.token
    }));
    
    // Navigate to dashboard
    navigate('/dashboard');
  };

  const handleBackToRegister = () => {
    setShowOTP(false);
    setRegisteredEmail('');
  };

  // Show OTP verification screen if needed
  if (showOTP && registeredEmail) {
    return (
      <OTPVerification
        email={registeredEmail}
        purpose="registration"
        onSuccess={handleOTPSuccess}
        onBack={handleBackToRegister}
      />
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h5">
              Create Your Account
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Join the Secure Healthcare Platform
            </Typography>
          </Box>

          <Formik
            initialValues={{
              name: '',
              email: '',
              password: '',
              confirmPassword: '',
              role: '',
              dateOfBirth: '',
              phone: '',
              gender: '',
              licenseNumber: '',
              specialization: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
              <Form>
                {errors.submit && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.submit}
                  </Alert>
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email />
                      </InputAdornment>
                    ),
                  }}
                />

                <FormControl fullWidth margin="normal" required error={touched.role && Boolean(errors.role)}>
                  <InputLabel id="role-label">Role</InputLabel>
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={values.role}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Role"
                    startAdornment={
                      <InputAdornment position="start">
                        <Badge />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="patient">Patient</MenuItem>
                    <MenuItem value="doctor">Doctor</MenuItem>
                    <MenuItem value="nurse">Nurse</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                  {touched.role && errors.role && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.role}
                    </Typography>
                  )}
                </FormControl>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="dateOfBirth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={values.dateOfBirth}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.dateOfBirth && Boolean(errors.dateOfBirth)}
                  helperText={touched.dateOfBirth && errors.dateOfBirth}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  placeholder="1234567890"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.phone && Boolean(errors.phone)}
                  helperText={touched.phone && errors.phone}
                />

                <FormControl fullWidth margin="normal" required error={touched.gender && Boolean(errors.gender)}>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                  {touched.gender && errors.gender && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>

                {(values.role === 'doctor' || values.role === 'nurse') && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="licenseNumber"
                    label="License Number"
                    name="licenseNumber"
                    value={values.licenseNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.licenseNumber && Boolean(errors.licenseNumber)}
                    helperText={touched.licenseNumber && errors.licenseNumber}
                  />
                )}

                {values.role === 'doctor' && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="specialization"
                    label="Specialization"
                    name="specialization"
                    placeholder="e.g., Cardiology, Pediatrics"
                    value={values.specialization}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.specialization && Boolean(errors.specialization)}
                    helperText={touched.specialization && errors.specialization}
                  />
                )}

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="new-password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.password && Boolean(errors.password)}
                  helperText={touched.password && errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ mt: 2, mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Password Requirements:
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    • At least 8 characters
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    • One uppercase letter, one lowercase letter
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    • One number and one special character (@$!%*?&)
                  </Typography>
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 2, mb: 2, py: 1.5 }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </Button>

                <Grid container justifyContent="center">
                  <Grid item>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Typography variant="body2" color="primary">
                        Already have an account? Login
                      </Typography>
                    </Link>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </Paper>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            🔒 Your data is protected with end-to-end encryption
          </Typography>
          <br />
          <Typography variant="caption" color="text.secondary">
            HIPAA & GDPR Compliant
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;

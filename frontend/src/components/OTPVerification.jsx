import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Link
} from '@mui/material';
import { VerifiedUser } from '@mui/icons-material';
import axios from 'axios';

const OTPVerification = ({ email, purpose = 'registration', onSuccess, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setResendDisabled(false);
    }
  }, [countdown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/verify-otp`,
        { email, otp, purpose }
      );

      if (response.data.success) {
        setSuccess('OTP verified successfully! Redirecting...');
        
        // Store tokens
        if (response.data.data.token) {
          localStorage.setItem('token', response.data.data.token);
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }

        setTimeout(() => {
          if (onSuccess) {
            onSuccess(response.data.data);
          }
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to verify OTP. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResendDisabled(true);
    setCountdown(60);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/resend-otp`,
        { email, purpose }
      );

      if (response.data.success) {
        setSuccess('OTP sent successfully! Please check your email.');
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        'Failed to resend OTP. Please try again.'
      );
      setResendDisabled(false);
      setCountdown(0);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2
      }}
    >
      <Paper
        elevation={24}
        sx={{
          p: 4,
          maxWidth: 450,
          width: '100%',
          borderRadius: 3,
          textAlign: 'center'
        }}
      >
        <Box sx={{ mb: 3 }}>
          <VerifiedUser sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Verify Your Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            We've sent a 6-digit verification code to
          </Typography>
          <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
            {email}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleVerify}>
          <TextField
            fullWidth
            label="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputProps={{
              maxLength: 6,
              style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }
            }}
            sx={{ mb: 3 }}
            disabled={loading}
            autoFocus
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading || otp.length !== 6}
            sx={{ mb: 2, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Verify OTP'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Didn't receive the code?{' '}
              {resendDisabled ? (
                <span>Resend in {countdown}s</span>
              ) : (
                <Link
                  component="button"
                  type="button"
                  onClick={handleResend}
                  sx={{ cursor: 'pointer' }}
                >
                  Resend OTP
                </Link>
              )}
            </Typography>
          </Box>

          {onBack && (
            <Button
              fullWidth
              variant="outlined"
              onClick={onBack}
              sx={{ mt: 2 }}
              disabled={loading}
            >
              Back to Registration
            </Button>
          )}
        </form>

        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="caption" color="text.secondary">
            <strong>Note:</strong> The OTP is valid for 10 minutes and can be used up to 3 times.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default OTPVerification;

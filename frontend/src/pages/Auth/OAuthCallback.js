import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { setCredentials } from '../../store/slices/authSlice';
import axios from 'axios';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const error = searchParams.get('error');

      if (error) {
        setTimeout(() => {
          navigate('/login', { 
            state: { error: 'OAuth authentication failed. Please try again.' } 
          });
        }, 2000);
        return;
      }

      if (token && refreshToken) {
        try {
          // Store tokens
          localStorage.setItem('token', token);
          localStorage.setItem('refreshToken', refreshToken);

          // Fetch user data
          const response = await axios.get(
            `${process.env.REACT_APP_API_URL}/auth/me`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );

          if (response.data.success) {
            // Update Redux store
            dispatch(setCredentials({
              user: response.data.data,
              token
            }));

            // Navigate to dashboard
            setTimeout(() => {
              navigate('/dashboard');
            }, 1000);
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
          setTimeout(() => {
            navigate('/login', {
              state: { error: 'Failed to complete authentication.' }
            });
          }, 2000);
        }
      } else {
        navigate('/login', {
          state: { error: 'Invalid authentication response.' }
        });
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, dispatch]);

  const error = searchParams.get('error');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Authentication failed. Redirecting...
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} sx={{ color: 'white', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'white', mb: 1 }}>
            Completing Sign In...
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Please wait while we set up your account
          </Typography>
        </>
      )}
    </Box>
  );
};

export default OAuthCallback;

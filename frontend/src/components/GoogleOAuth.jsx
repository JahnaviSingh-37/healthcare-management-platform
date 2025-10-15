import React from 'react';
import { Button, Box, Divider, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';

const GoogleOAuth = ({ onSuccess, onError, buttonText = 'Continue with Google' }) => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001/api/v1';
    const redirectUrl = `${backendUrl}/auth/google`;
    
    // Store return URL for after OAuth completes
    localStorage.setItem('oauthReturnUrl', window.location.pathname);
    
    // Redirect to Google OAuth
    window.location.href = redirectUrl;
  };

  return (
    <Box sx={{ width: '100%', my: 2 }}>
      <Divider sx={{ my: 2 }}>
        <Typography variant="body2" color="text.secondary">
          OR
        </Typography>
      </Divider>
      
      <Button
        fullWidth
        variant="outlined"
        size="large"
        startIcon={<Google />}
        onClick={handleGoogleLogin}
        sx={{
          borderColor: '#4285f4',
          color: '#4285f4',
          '&:hover': {
            borderColor: '#357ae8',
            backgroundColor: 'rgba(66, 133, 244, 0.04)',
          },
          py: 1.5,
          textTransform: 'none',
          fontSize: '16px',
        }}
      >
        {buttonText}
      </Button>
    </Box>
  );
};

export default GoogleOAuth;

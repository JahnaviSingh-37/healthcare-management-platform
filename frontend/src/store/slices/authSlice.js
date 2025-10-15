import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../../utils/api';
import { toast } from 'react-toastify';
import {jwtDecode} from 'jwt-decode';

// Load user from token
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return rejectWithValue('No token found');
      }

      // Check if token is expired
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem('token');
        return rejectWithValue('Token expired');
      }

      setAuthToken(token);
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.response?.data?.error || 'Failed to load user');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      
      // Extract data from the response
      const { user, token, refreshToken } = response.data.data || response.data;
      
      if (token && refreshToken) {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        setAuthToken(token);
        
        toast.success('Registration successful!');
        return { user, token, refreshToken };
      } else {
        // OTP verification required
        toast.info('Please check your email for verification code');
        return { requiresOTP: true, user: response.data.data };
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return rejectWithValue(error.response?.data?.error || 'Registration failed');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Check if MFA is required
      if (response.data.mfaRequired) {
        return {
          mfaRequired: true,
          tempToken: response.data.tempToken,
        };
      }
      
      const { user, token, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setAuthToken(token);
      
      toast.success('Login successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

// Verify MFA
export const verifyMFA = createAsyncThunk(
  'auth/verifyMFA',
  async ({ tempToken, mfaCode }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/mfa/verify', { tempToken, mfaCode });
      const { user, token, refreshToken } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setAuthToken(token);
      
      toast.success('MFA verification successful!');
      return user;
    } catch (error) {
      toast.error(error.response?.data?.error || 'MFA verification failed');
      return rejectWithValue(error.response?.data?.error || 'MFA verification failed');
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('mfaToken');
      setAuthToken(null);
      toast.success('Logged out successfully');
    } catch (error) {
      return rejectWithValue(error.response?.data?.error || 'Logout failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null,
    mfaRequired: false,
    tempToken: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setMFARequired: (state, action) => {
      state.mfaRequired = action.payload.required;
      state.tempToken = action.payload.tempToken;
    },
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      if (action.payload.token) {
        localStorage.setItem('token', action.payload.token);
        setAuthToken(action.payload.token);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Load User
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(loadUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        
        // Check if it's a successful registration with tokens or requires OTP
        if (action.payload?.requiresOTP) {
          // OTP verification needed, don't set authenticated yet
          state.isAuthenticated = false;
          state.user = null;
        } else if (action.payload?.user) {
          // Successful registration with tokens
          state.isAuthenticated = true;
          state.user = action.payload.user;
        }
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.mfaRequired) {
          state.mfaRequired = true;
          state.tempToken = action.payload.tempToken;
        } else {
          state.isAuthenticated = true;
          state.user = action.payload;
          state.error = null;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify MFA
      .addCase(verifyMFA.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyMFA.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.mfaRequired = false;
        state.tempToken = null;
        state.error = null;
      })
      .addCase(verifyMFA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
        state.mfaRequired = false;
        state.tempToken = null;
      });
  },
});

export const { clearError, setMFARequired, setCredentials } = authSlice.actions;
export default authSlice.reducer;

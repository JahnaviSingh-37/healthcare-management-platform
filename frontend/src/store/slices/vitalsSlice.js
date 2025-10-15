import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchVitals = createAsyncThunk(
  'vitals/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/vitals?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

export const createVitals = createAsyncThunk(
  'vitals/create',
  async (vitalsData, { rejectWithValue }) => {
    try {
      const response = await api.post('/vitals', vitalsData);
      toast.success('Vitals recorded successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to record vitals');
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

const vitalsSlice = createSlice({
  name: 'vitals',
  initialState: {
    vitals: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVitals.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchVitals.fulfilled, (state, action) => {
        state.loading = false;
        state.vitals = action.payload;
      })
      .addCase(fetchVitals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createVitals.fulfilled, (state, action) => {
        state.vitals.unshift(action.payload);
      });
  },
});

export const { clearError } = vitalsSlice.actions;
export default vitalsSlice.reducer;

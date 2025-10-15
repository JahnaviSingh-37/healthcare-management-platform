import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export const fetchHealthRecords = createAsyncThunk(
  'healthRecords/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams(filters);
      const response = await api.get(`/health-records?${params}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

export const createHealthRecord = createAsyncThunk(
  'healthRecords/create',
  async (recordData, { rejectWithValue }) => {
    try {
      const response = await api.post('/health-records', recordData);
      toast.success('Health record created successfully');
      return response.data;
    } catch (error) {
      toast.error('Failed to create health record');
      return rejectWithValue(error.response?.data?.error);
    }
  }
);

const healthRecordSlice = createSlice({
  name: 'healthRecords',
  initialState: {
    records: [],
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
      .addCase(fetchHealthRecords.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHealthRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(fetchHealthRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createHealthRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      });
  },
});

export const { clearError } = healthRecordSlice.actions;
export default healthRecordSlice.reducer;

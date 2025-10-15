import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import healthRecordReducer from './slices/healthRecordSlice';
import vitalsReducer from './slices/vitalsSlice';
import themeReducer from './slices/themeSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    healthRecords: healthRecordReducer,
    vitals: vitalsReducer,
    theme: themeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;

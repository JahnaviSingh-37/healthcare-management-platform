import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box } from '@mui/material';
import { loadUser } from './store/slices/authSlice';

// Import pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import OAuthCallback from './pages/Auth/OAuthCallback';
import Dashboard from './pages/Dashboard/Dashboard';
import HealthRecords from './pages/HealthRecords/HealthRecords';
import Vitals from './pages/Vitals/Vitals';
import Profile from './pages/Profile/Profile';
import AdminPanel from './pages/Admin/AdminPanel';
import Appointments from './pages/Appointments/Appointments';
import AppointmentScheduler from './pages/Appointments/AppointmentScheduler';
import PrescriptionList from './pages/Prescriptions/PrescriptionList';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [initialLoad, setInitialLoad] = React.useState(true);

  useEffect(() => {
    // Load user from token on app start
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(loadUser()).finally(() => setInitialLoad(false));
    } else {
      setInitialLoad(false);
    }
  }, [dispatch]);

  if (initialLoad) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        Loading...
      </Box>
    );
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" /> : <Register />
        }
      />
      <Route path="/oauth/callback" element={<OAuthCallback />} />

      {/* Private Routes */}
      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/health-records" element={<HealthRecords />} />
          <Route path="/vitals" element={<Vitals />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/appointments/schedule" element={<AppointmentScheduler />} />
          <Route path="/prescriptions" element={<PrescriptionList />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>
      </Route>

      {/* Default Route */}
      <Route
        path="/"
        element={
          <Navigate to={isAuthenticated ? '/dashboard' : '/login'} />
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;

import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Container,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  MedicalServices,
  MonitorHeart,
  Person,
  AdminPanelSettings,
  Logout,
  Security,
  CalendarMonth,
  LocalPharmacy,
  Notifications,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';
import DarkModeToggle from '../DarkModeToggle';

const drawerWidth = 240;

const Layout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleOpenNotifications = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleCloseNotifications = () => {
    setAnchorElNotifications(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Health Records', icon: <MedicalServices />, path: '/health-records' },
    { text: 'Vitals', icon: <MonitorHeart />, path: '/vitals' },
    { text: 'Appointments', icon: <CalendarMonth />, path: '/appointments' },
    { text: 'Prescriptions', icon: <LocalPharmacy />, path: '/prescriptions' },
    { text: 'Profile', icon: <Person />, path: '/profile' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ text: 'Admin Panel', icon: <AdminPanelSettings />, path: '/admin' });
  }

  const drawer = (
    <Box>
      <Toolbar>
        <Security sx={{ mr: 1 }} />
        <Typography variant="h6" noWrap component="div">
          Healthcare
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Secure Healthcare Platform
          </Typography>
          
          {/* Notifications Icon */}
          <IconButton 
            color="inherit" 
            onClick={handleOpenNotifications}
            sx={{ mr: 1 }}
          >
            <Badge badgeContent={3} color="error">
              <Notifications />
            </Badge>
          </IconButton>
          <Menu
            anchorEl={anchorElNotifications}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotifications}
            PaperProps={{
              style: {
                maxHeight: 400,
                width: '350px',
              },
            }}
          >
            <MenuItem onClick={handleCloseNotifications}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Appointment Reminder
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  You have an appointment tomorrow at 10:00 AM
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseNotifications}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Lab Results Ready
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your recent test results are now available
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleCloseNotifications}>
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  Prescription Refill Due
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Time to refill your medication
                </Typography>
              </Box>
            </MenuItem>
          </Menu>

          <DarkModeToggle />
          <Box sx={{ flexGrow: 0, ml: 1 }}>
            <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
              <Avatar alt={user?.firstName}>
                {user?.firstName?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              sx={{ mt: '45px' }}
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleCloseUserMenu(); }}>
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;

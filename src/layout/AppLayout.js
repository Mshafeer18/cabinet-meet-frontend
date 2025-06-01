// src/layout/AppLayout.jsx
import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Container,
} from '@mui/material';

import RegistrationFlow from '../features/registration/RegistrationFlow';
import AdminRegistrations from '../features/admin/AdminRegistrations';
import AdminIDCards from '../features/admin/AdminIDCards';

const AppLayout = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState('');
  const navigate = useNavigate();

  const handleAdminLoginClick = () => setAdminDialogOpen(true);

  const handleAdminLogin = () => {
    if (adminUsername === 'admin' && adminPassword === 'admin') {
      setIsAdmin(true);
      setAdminDialogOpen(false);
      setAdminError('');
      navigate('/admin/registrations');
    } else {
      setAdminError('Invalid credentials. Please try again.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    setAdminUsername('');
    setAdminPassword('');
    navigate('/');
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#5A827E' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Button
              component={Link}
              to="/"
              color="inherit"
              sx={{ textTransform: 'none', fontSize: '1.25rem' }}
              >
              <span
                style={{
                fontFamily: '"Cooper Black", serif',
                fontSize: '1.6rem',
                marginRight: '8px', // adds extra space before "KADABA ZONE"
                }}
              >
              SKSSF
              </span>
              KADABA ZONE
            </Button>
          </Typography>
          {!isAdmin ? (
            <Button color="inherit" onClick={handleAdminLoginClick}>
              Admin Login
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <Button
                color="inherit"
                component={Link}
                to="/admin/registrations"
              >
                Registrations
              </Button>
              <Button color="inherit" component={Link} to="/admin/idcards">
                ID Cards
              </Button>
              <Button color="inherit" onClick={handleAdminLogout}>
                Logout
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Admin Login Modal */}
      <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} sx={{ backgroundColor: '#FAFFCA' }}>
        <DialogTitle sx={{ backgroundColor: '#FAFFCA', borderBottom: '1px solid #5A827E', textAlign: 'center',}}>ADMIN LOGIN</DialogTitle>
        <DialogContent sx={{ backgroundColor: '#FAFFCA' }}>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Username"
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            sx={{
              // Set the label color to #5A827E when focused.
              '& label.Mui-focused': {
                color: '#5A827E',
              },
              // Set the border color of the outlined TextField when it is focused.
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#5A827E',
              },
            }}
          />
          <TextField
            fullWidth
            margin="dense"
            type="password"
            label="Password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            
            sx={{
              // Set the label color to #5A827E when focused.
              '& label.Mui-focused': {
                color: '#5A827E',
              },
              // Set the border color of the outlined TextField when it is focused.
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
                borderColor: '#5A827E',
              },
            }}
          />
          {adminError && (
            <Typography color="error" variant="body2">
              {adminError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#FAFFCA' }}>
          <Button onClick={() => setAdminDialogOpen(false)} sx={{ color: '#5A827E' }}>Cancel</Button>
          <Button onClick={handleAdminLogin}sx={{ color: '#5A827E' }}>Login</Button>
        </DialogActions>
      </Dialog>

      {/* Main Content Area */}
      <Container sx={{ my: 4 }}>
        <Routes>
          <Route path="/" element={<RegistrationFlow />} />

          {/* Protected Admin Routes */}
          <Route
            path="/admin/registrations"
            element={
              isAdmin ? (
                <AdminRegistrations />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin/idcards"
            element={
              isAdmin ? <AdminIDCards /> : <Navigate to="/" replace />
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <Box textAlign="center" mt={5}>
                <Typography variant="h4" gutterBottom>
                  404 – Page Not Found
                </Typography>
                <Button component={Link} to="/" variant="contained">
                  Go to Home
                </Button>
              </Box>
            }
          />
        </Routes>
      </Container>
    </>
  );
};

export default AppLayout;

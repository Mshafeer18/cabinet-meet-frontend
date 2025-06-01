// src/features/registration/RegistrationFlow.js
import React, { useState, useCallback } from 'react';
import RegistrationForm from './components/RegistrationForm';
import ConfirmationPage from '../confirmation/ConfirmationPage';
import IDCard from '../idcard/IDCard';
import { API_BASE_URL } from '../../config';
import {
  Snackbar,
  Alert,
  CircularProgress,
  Box,
} from '@mui/material';

const RegistrationFlow = () => {
  const [view, setView] = useState('form');
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  const handleFormSubmit = useCallback((data) => {
    setFormData(data);
    setView('confirmation');
  }, []);

  const handleEdit = useCallback(() => {
    setView('form');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!formData) return;
    setIsSubmitting(true);

    // Prepare form data for API
    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('cluster', formData.cluster);
    dataToSend.append('unit', formData.unit);
    dataToSend.append('designations', formData.designations.join(','));
    if (formData.photo) {
      dataToSend.append('photo', formData.photo);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        body: dataToSend,
      });
      const result = await response.json();

      if (response.ok) {
        setSnackSeverity('success');
        setSnackMessage(result.message || 'Registration successful!');
        setSnackOpen(true);

        // Move to ID card view after a short delay so user sees the snackbar
        setTimeout(() => {
          setView('idcard');
        }, 1000);
      } else {
        setSnackSeverity('error');
        setSnackMessage(`Registration failed: ${result.message || 'Unknown error'}`);
        setSnackOpen(true);
        setView('form');
      }
    } catch (error) {
      console.error('Error during registration submission:', error);
      setSnackSeverity('error');
      setSnackMessage('An error occurred during registration. Please try again.');
      setSnackOpen(true);
      setView('form');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  if (view === 'form') {
    return (
      <RegistrationForm
        onSubmit={handleFormSubmit}
        initialData={formData || {}}
      />
    );
  }

  if (view === 'confirmation') {
    return (
      <>
        <ConfirmationPage
          formData={formData}
          onEdit={handleEdit}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
        />
        {isSubmitting && (
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          onClose={handleSnackClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleSnackClose}
            severity={snackSeverity}
            sx={{ width: '100%' }}
          >
            {snackMessage}
          </Alert>
        </Snackbar>
      </>
    );
  }

  if (view === 'idcard') {
    if (!formData) return null; // safety check
    return <IDCard formData={formData} />;
  }

  return null;
};

export default RegistrationFlow;

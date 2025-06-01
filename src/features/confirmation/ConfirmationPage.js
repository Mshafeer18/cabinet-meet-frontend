// src/features/confirmation/ConfirmationPage.js
import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Divider,
  CircularProgress,
} from '@mui/material';

function ConfirmationPage({ formData, onEdit, onConfirm, isSubmitting }) {
  return (
    <Box sx={{ backgroundColor: '#B9D4AA', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, backgroundColor: '#FAFFCA' }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ color: '#5A827E', fontWeight: 'bold' }}>
            Confirm Your Details
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: 'center' }}>
  {/* Name Field */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ color: '#84AE92', fontWeight: 'bold' }}>
      Name
    </Typography>
    <Typography variant="body1" sx={{ color: '#5A827E', fontWeight: 'bold'}}>
      {formData.name || '—'}
    </Typography>
  </Box>
  
  {/* Cluster Field */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ color: '#84AE92', fontWeight: 'bold' }}>
      Cluster
    </Typography>
    <Typography variant="body1" sx={{ color: '#5A827E', fontWeight: 'bold' }}>
      {formData.cluster || '—'}
    </Typography>
  </Box>
  
  {/* Unit Field */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ color: '#84AE92', fontWeight: 'bold' }}>
      Unit
    </Typography>
    <Typography variant="body1" sx={{ color: '#5A827E', fontWeight: 'bold' }}>
      {formData.unit || '—'}
    </Typography>
  </Box>
  
  {/* Designations Field */}
  <Box sx={{ mb: 2 }}>
    <Typography variant="body1" sx={{ color: '#84AE92', fontWeight: 'bold' }}>
      Designations
    </Typography>
    <Typography variant="body1" sx={{ color: '#5A827E', fontWeight: 'bold' }}>
      {formData.designations?.length > 0 ? formData.designations.join(', ') : '—'}
    </Typography>
  </Box>
</Box>

          {formData.photoPreview && (
            <Box sx={{ textAlign: 'center', mb: 2 }}>
              <img
                src={formData.photoPreview}
                alt={formData.name || 'Preview'}
                style={{
                  width: 100,
                  height: 100,
                  objectFit: 'cover',
                  border: '1px solid #ccc',
                  borderRadius: '50%',
                }}
              />
            </Box>
          )}

          <Button
            variant="contained"
            onClick={onConfirm}
            fullWidth
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? <CircularProgress size={20} color="inherit" /> : null
            }
            sx={{ mt: 2, textTransform: 'none', backgroundColor: '#84AE92', '&:hover': { backgroundColor: '#5A827E'} }}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm'}
          </Button>

          <Button
            variant="outlined"
            onClick={onEdit}
            fullWidth
            disabled={isSubmitting}
            sx={{
              mt: 1,
              textTransform: 'none',
              color: '#5A827E',
              borderColor: '#5A827E',
              '&:hover': {
                borderColor: '#5A827E',
                backgroundColor: 'rgba(90, 130, 126, 0.08)' // a subtle background color on hover
              }
            }}
          >
            Edit
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}

export default ConfirmationPage;

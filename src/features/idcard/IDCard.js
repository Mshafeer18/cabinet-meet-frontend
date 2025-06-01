// src/features/idcard/IDCard.js
import React, { useRef, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import html2canvas from 'html2canvas';

// Utility to get formatted date and day (e.g., "01-06-2025 Sunday")
const getFormattedDateAndDay = () => {
  const eventDate = new Date('2025-06-01'); // Fixed event date
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const dateStr = eventDate.toLocaleDateString('en-GB', options).replace(/\//g, '-');
  const dayName = eventDate.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${dateStr} ${dayName}`;
};

function IDCard({ formData }) {
  const cardRef = useRef();
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  const footerDate = getFormattedDateAndDay();

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsDownloading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 10, // High-res but not excessive
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement('a');
      link.download = 'id_card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      setSnackSeverity('success');
      setSnackMessage('ID card generated successfully.');
      setSnackOpen(true);
    } catch (err) {
      console.error('Error generating image for download:', err);
      setSnackSeverity('error');
      setSnackMessage('Failed to generate ID card. Please try again.');
      setSnackOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  return (
    <Box sx={{ backgroundColor: '#B9D4AA', minHeight: '100vh', py: 2 }}>
      <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
        <Paper
          ref={cardRef}
          elevation={0}
          sx={{
            width: '5.9cm',
            height: '8.4cm',
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            p: 0,
            backgroundColor: '#B9D4AA',
            border : '1px solid #5A827E',
            borderRadius: 0,
          }}
        >
          {/* Header */}
          <Box sx={{ p: '0.1cm' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src="/flag.png"
                alt="Flag"
                sx={{ width: '1cm', height: 'auto' }}
              />
              <Box
                component="img"
                src="/logo.png"
                alt="Logo"
                sx={{ width: '1cm', height: 'auto' }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: '0.4cm',
                textAlign: 'center',
                fontWeight: 'bold',
                m: 0,
              }}
            >
              <span
                style={{
                  fontFamily: '"Cooper Black", serif',
                  textTransform: 'uppercase',
                }}
              >
                SKSSF
              </span>
            </Typography>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textAlign: 'center',
                textTransform: 'capitalize',
                fontWeight: 'bold',
                m: 0,
              }}
            >
              KADABA ZONE
            </Typography>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textAlign: 'center',
                textTransform: 'capitalize',
                m: 0,
              }}
            >
              Annual Cabinet Meet - 2025
            </Typography>
          </Box>

          {/* Body (Photo + Details) */}
          <Box
            sx={{
              flexGrow: 1,
              p: '0.1cm',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: '2cm',
                height: '2.5cm',
                border: '0.03cm solid #5A827E',
                overflow: 'hidden',
                mb: '0.1cm',
              }}
            >
              {formData.photoPreview ? (
                <Box
                  component="img"
                  src={formData.photoPreview}
                  alt={`Portrait of ${formData.name}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: '0.3cm',
                    fontFamily: 'Helvetica, sans-serif',
                    textTransform: 'capitalize',
                    textAlign: 'center',
                    lineHeight: '2.5cm',
                    m: 0,
                  }}
                >
                  no photo
                </Typography>
              )}
            </Box>

            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                fontWeight: 'bold',
                m: 0,
              }}
            >
              {formData.name}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                m: 0,
              }}
            >
              {formData.cluster} - {formData.unit}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                fontWeight: 'bold',
                m: 0,
              }}
            >
              {formData.designations?.length
                ? formData.designations.join(', ')
                : 'N/A'}
            </Typography>
          </Box>

          {/* Footer */}
          <Box sx={{ backgroundColor: '#5A827E', p: '0.1cm' }}>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                color:'white',
                m: 0,
                textAlign: 'center',
              }}
            >
              {footerDate}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                color:'white',
                m: 0,
                textAlign: 'center',
              }}
            >
              Mueenul Islam Madrasa Kadaba
            </Typography>
          </Box>
        </Paper>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownload}
            disabled={isDownloading}
            startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ textTransform: 'none', backgroundColor: '#5A827E', '&:hover': { backgroundColor: '#46566A'} }}
          >
            {isDownloading ? 'Generating...' : 'Download ID Card'}
          </Button>
        </Box>

        <Snackbar
          open={snackOpen}
          autoHideDuration={4000}
          onClose={handleSnackClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackClose} severity={snackSeverity} sx={{ width: '100%' }}>
            {snackMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
}

export default IDCard;

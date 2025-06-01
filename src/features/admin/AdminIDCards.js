// src/features/admin/AdminIDCards.js

import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Utility to get formatted date and day (e.g., "01-06-2025 Sunday")
const getFormattedDateAndDay = () => {
  const eventDate = new Date('2025-06-01'); // Fixed event date
  const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const dateStr = eventDate.toLocaleDateString('en-GB', options).replace(/\//g, '-');
  const dayName = eventDate.toLocaleDateString('en-GB', { weekday: 'long' });
  return `${dateStr} ${dayName}`;
};


// Helper to build a clean photo URL
const getPhotoSrc = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) {
    return photoUrl;
  }
  // Ensure exactly one slash between API_BASE_URL and photoUrl
  const slash = photoUrl.startsWith('/') ? '' : '/';
  return `${API_BASE_URL}${slash}${photoUrl}`;
};

// IDCardPreview replicates IDCard.js design exactly (no outer border)
const IDCardPreview = ({ data, footerDate }) => {
  const photoSrc = getPhotoSrc(data.photo);

  return (
    <Box
      sx={{
        width: '5.9cm',
        height: '8.4cm',
        backgroundColor: '#B9D4AA',
        display: 'flex',
        flexDirection: 'column',
        p: '0cm',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Box sx={{ p: '0.1cm' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box component="img" src="/flag.png" alt="Flag" sx={{ width: '1cm', height: 'auto' }} />
          <Box component="img" src="/logo.png" alt="Logo" sx={{ width: '1cm', height: 'auto' }} />
        </Box>
        <Typography
          sx={{
            fontSize: '0.4cm',
            textAlign: 'center',
            fontFamily: '"Cooper Black", serif',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            m: 0,
          }}
        >
          SKSSF
        </Typography>
        <Typography
          sx={{
            fontSize: '0.3cm',
            textAlign: 'center',
            fontFamily: 'Helvetica, sans-serif',
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
            textAlign: 'center',
            fontFamily: 'Helvetica, sans-serif',
            textTransform: 'capitalize',
            m: 0,
          }}
        >
          Annual Cabinet Meet  2025
        </Typography>
      </Box>

      {/* Body */}
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
            border: '0.03cm solid #333',
            overflow: 'hidden',
            mb: '0.1cm',
          }}
        >
          {photoSrc ? (
            <Box
              component="img"
              src={photoSrc}
              alt={`Portrait of ${data.name}`}
              sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Typography
              sx={{
                fontSize: '0.3cm',
                fontFamily: 'Helvetica, sans-serif',
                textTransform: 'capitalize',
                m: 0,
                textAlign: 'center',
                lineHeight: '2.5cm',
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
            fontWeight: 'bold',
            textAlign: 'center',
            m: 0,
          }}
        >
          {data.name}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.3cm',
            fontFamily: 'Helvetica, sans-serif',
            textAlign: 'center',
            m: 0,
          }}
        >
          {data.cluster} - {data.unit}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.3cm',
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: 'bold',
            textAlign: 'center',
            m: 0,
          }}
        >
          {data.designations}
        </Typography>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: '#5A827E', p: '0.1cm' }}>
        <Typography
          sx={{
            fontSize: '0.3cm',
            fontFamily: 'Helvetica, sans-serif',
            textAlign: 'center',
            textTransform: 'capitalize',
            color:'white',
            m: 0,
          }}
        >
          {footerDate}
        </Typography>
        <Typography
          sx={{
            fontSize: '0.3cm',
            fontFamily: 'Helvetica, sans-serif',
            textAlign: 'center',
            textTransform: 'capitalize',
            color:'white',
            m: 0,
          }}
        >
          Mueenul Islam Madrasa Kadaba
        </Typography>
      </Box>
    </Box>
  );
};

const AdminIDCards = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  const footerDate = getFormattedDateAndDay();

  // Fetch registrations (memoized so we can use it on retry)
  const fetchRegistrations = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/registrations`);
      if (!res.ok) throw new Error('Failed to fetch registrations');
      const data = await res.json();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load registrations. Try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount
  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const exportToPDF = async () => {
    const container = document.getElementById('a3-container');
    if (!container) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(container, {
        scale: 3,
        useCORS: true,
        allowTaint: false,
      });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      const pdf = new jsPDF('portrait', 'mm', 'a3');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('bulk_id_cards.pdf');
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setSnackSeverity('error');
      setSnackMessage('Failed to export ID cards. Please try again.');
      setSnackOpen(true);
    } finally {
      setExporting(false);
    }
  };

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bulk ID Cards – Export as A3 PDF
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
          <Button variant="contained" onClick={fetchRegistrations}>
            Retry
          </Button>
        </Box>
      ) : registrations.length === 0 ? (
        <Typography align="center" sx={{ mt: 4 }}>
          No registrations found.
        </Typography>
      ) : (
        <>
          {/* A3-sized container (297mm x 420mm) */}
          <Box
            id="a3-container"
            sx={{
              width: '297mm',
              height: '420mm',
              backgroundColor: 'white',
              p: '5mm',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <Grid container spacing={1}>
              {registrations.map((reg) => {
                const data = {
                  photo: reg.photoUrl,
                  name: reg.name,
                  cluster: reg.cluster,
                  unit: reg.unit,
                  designations: reg.designations.join(', '),
                };
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={reg._id}>
                    <IDCardPreview data={data} footerDate={footerDate} />
                  </Grid>
                );
              })}
            </Grid>
          </Box>

          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button
              variant="contained"
              disabled={exporting}
              onClick={exportToPDF}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ textTransform: 'none', backgroundColor: '#5A827E',
    '&:hover': { backgroundColor: '#46566A' } }}
            >
              {exporting ? 'Exporting...' : 'Export to PDF (A3)'}
            </Button>
          </Box>
        </>
      )}

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
  );
};

export default AdminIDCards;

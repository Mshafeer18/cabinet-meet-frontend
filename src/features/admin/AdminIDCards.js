// src/features/admin/AdminIDCards.js

import React, { useEffect, useState, useCallback, useRef } from 'react';
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

// 2) Helper to build full photo URL
const getPhotoSrc = (photoUrl) => {
  if (!photoUrl) return null;
  if (photoUrl.startsWith('http')) return photoUrl;
  const slash = photoUrl.startsWith('/') ? '' : '/';
  return `${API_BASE_URL}${slash}${photoUrl}`;
};

// 3) Unit conversions & constants
//    On-screen preview uses cm→px at 96 DPI:
const cmToPx96 = (cm) => Math.round(cm * 37.8);

//    Capture mode uses cm→px at 300 DPI:
const cmToPx300 = (cm) => Math.round(cm * (300 / 2.54));

// Card native pixel dims: 5.9 cm × 8.4 cm @ 300 DPI → 696 × 992 px
const CARD_WIDTH_PX = cmToPx300(5.9);
const CARD_HEIGHT_PX = cmToPx300(8.4);

// A3 page dims @ 300 DPI: 297 mm × 420 mm → 29.7 cm × 42.0 cm → 3508 × 4961 px
const A3_WIDTH_PX = cmToPx300(29.7);
const A3_HEIGHT_PX = cmToPx300(42.0);

// Overlay positions (in cm):
const PHOTO_DIAMETER_CM = 2.5;
const PHOTO_TOP_CM = 1.9;
const PHOTO_LEFT_CM = (5.9 - PHOTO_DIAMETER_CM) / 2;

const NAME_TOP_CM = 4.8;           // approximately where name should appear
const DESIGNATION_TOP_CM = 5.5;
const CLUSTER_UNIT_TOP_CM = 6.2;

// 4) IDCardPreview: renders one card either “preview” (5.9 cm×8.4 cm on-screen) or “capture” (696×992 px)
const IDCardPreview = ({ data, captureMode }) => {
  const cmToPx = captureMode ? cmToPx300 : cmToPx96;

  // Photo dimensions & position
  const photoDiameterPx = cmToPx(PHOTO_DIAMETER_CM);
  const photoTopPx = cmToPx(PHOTO_TOP_CM);
  const photoLeftPx = captureMode
    ? Math.round((CARD_WIDTH_PX - photoDiameterPx) / 2)
    : cmToPx(PHOTO_LEFT_CM);

  // Text positions in px
  const nameTopPx = cmToPx(NAME_TOP_CM);
  const designationTopPx = cmToPx(DESIGNATION_TOP_CM);
  const clusterUnitTopPx = cmToPx(CLUSTER_UNIT_TOP_CM);

  // Build photo URL
  const photoSrc = getPhotoSrc(data.photo);

  // Container dimensions
  const width = captureMode ? `${CARD_WIDTH_PX}px` : '5.9cm';
  const height = captureMode ? `${CARD_HEIGHT_PX}px` : '8.4cm';

  return (
    <Box
      sx={{
        position: 'relative',
        width,
        height,
        backgroundImage: 'url("/idcard-template.png")', // Ensure this file is 696×992 px
        backgroundSize: '100% 100%',
        backgroundRepeat: 'no-repeat',
        boxSizing: 'border-box',
      }}
    >
      {/* Photo Overlay */}
      {photoSrc && (
        <Box
          component="img"
          src={photoSrc}
          alt={`Photo of ${data.name}`}
          sx={{
            position: 'absolute',
            top: `${photoTopPx}px`,
            left: `${photoLeftPx}px`,
            width: `${photoDiameterPx}px`,
            height: `${photoDiameterPx}px`,
            borderRadius: captureMode ? 0 : '50%',
            objectFit: 'cover',
            backgroundColor: '#fff',
          }}
        />
      )}

      {/* Name Overlay */}
      <Typography
        sx={{
          position: 'absolute',
          top: `${nameTopPx}px`,
          left: 0,
          width: '100%',
          fontSize: captureMode ? `${cmToPx(0.35)}px` : '0.35cm',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 700,
          color: '#000',
          textTransform: 'uppercase',
          textAlign: 'center',
        }}
      >
        {data.name}
      </Typography>

      {/* Designation Overlay */}
      <Typography
        sx={{
          position: 'absolute',
          top: `${designationTopPx}px`,
          left: 0,
          width: '100%',
          fontSize: captureMode ? `${cmToPx(0.30)}px` : '0.30cm',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 500,
          color: '#333',
          textTransform: 'capitalize',
          textAlign: 'center',
        }}
      >
        {data.designations}
      </Typography>

      {/* Cluster – Unit Overlay */}
      <Typography
        sx={{
          position: 'absolute',
          top: `${clusterUnitTopPx}px`,
          left: 0,
          width: '100%',
          fontSize: captureMode ? `${cmToPx(0.28)}px` : '0.28cm',
          fontFamily: 'Roboto, sans-serif',
          fontWeight: 400,
          color: '#333',
          textTransform: 'capitalize',
          textAlign: 'center',
        }}
      >
        {data.cluster} – {data.unit}
      </Typography>
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

  //const footerDate = getFormattedDateAndDay();

  // Fetch registrations
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

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Ref for hidden A3 capture container
  const captureRef = useRef();

  // Export to A3 PDF
  const exportToPDF = async () => {
    if (!captureRef.current) return;
    setExporting(true);

    try {
      // Capture hidden A3 container at scale:1 (3508×4961 px)
      const canvas = await html2canvas(captureRef.current, {
        scale: 1,
        useCORS: true,
        allowTaint: false,
      });

      // Convert to JPEG Data URL
      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Create A3 PDF at 300 DPI
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [A3_WIDTH_PX, A3_HEIGHT_PX],
      });
      pdf.addImage(imgData, 'JPEG', 0, 0, A3_WIDTH_PX, A3_HEIGHT_PX);
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

  const handleSnackClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, position: 'relative' }}>
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
          {/* On‐screen grid of previews (5.9 cm × 8.4 cm each) */}
          <Grid container spacing={2}>
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
                  <IDCardPreview data={data} captureMode={false} />
                </Grid>
              );
            })}
          </Grid>

          <Box sx={{ textAlign: 'right', mt: 2 }}>
            <Button
              variant="contained"
              disabled={exporting}
              onClick={exportToPDF}
              startIcon={exporting ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{
                textTransform: 'none',
                backgroundColor: '#5A827E',
                '&:hover': { backgroundColor: '#46566A' },
              }}
            >
              {exporting ? 'Exporting...' : 'Export to PDF (A3)'}
            </Button>
          </Box>

          {/* Hidden off-screen A3 container (3508×4961 px) */}
          <Box
            ref={captureRef}
            sx={{
              width: `${A3_WIDTH_PX}px`,
              height: `${A3_HEIGHT_PX}px`,
              position: 'absolute',
              top: -10000,
              left: -10000,
              backgroundColor: '#ffffff',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexWrap: 'wrap',
              }}
            >
              {registrations.map((reg) => {
                const data = {
                  photo: reg.photoUrl,
                  name: reg.name,
                  cluster: reg.cluster,
                  unit: reg.unit,
                  designations: reg.designations.join(', '),
                };
                return (
                  <Box
                    key={reg._id}
                    sx={{ width: `${CARD_WIDTH_PX}px`, height: `${CARD_HEIGHT_PX}px` }}
                  >
                    <IDCardPreview data={data} captureMode={true} />
                  </Box>
                );
              })}
            </Box>
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

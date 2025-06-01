// src/features/idcard/IDCard.js

import React, { useRef, useState } from 'react';
import {
  Container,
  Box,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Typography,
} from '@mui/material';
import html2canvas from 'html2canvas';

// Template “native” pixel dimensions (5.9 cm × 8.4 cm @ 300 DPI)
const TEMPLATE_WIDTH_PX = 696;
const TEMPLATE_HEIGHT_PX = 992;

// Overlay positions (in cm) for on-screen preview
const PHOTO_DIAMETER_CM = 2.5;
const PHOTO_TOP_CM = 1.7;
const PHOTO_LEFT_CM = (5.9 - PHOTO_DIAMETER_CM) / 2;

const NAME_TOP_CM = 4.5;
//const DESIGNATION_TOP_CM = 5.7;
const CLUSTER_UNIT_TOP_CM = 6.8;

// Utility: convert cm → px at 96 DPI for on-screen preview
const cmToPx96 = (cm) => Math.round(cm * 37.8);

// Utility: convert cm → px at 300 DPI for hidden capture
const cmToPx300 = (cm) => Math.round(cm * (300 / 2.54));

function IDCard({ formData }) {
  const previewRef = useRef();     // Ref for the on‐screen preview (5.9 cm×8.4 cm)
  const captureContainerRef = useRef(); // Ref for the hidden offscreen capture
  const [isDownloading, setIsDownloading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  const handleDownload = async () => {
    if (!captureContainerRef.current) return;
    setIsDownloading(true);

    try {
      // Capture the hidden container (exactly 696×992 px, no scaling)
      const canvas = await html2canvas(captureContainerRef.current, {
        scale: 5,
        useCORS: true,
        allowTaint: false,
      });
      const link = document.createElement('a');
      link.download = 'id_card.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      setSnackSeverity('success');
      setSnackMessage('ID card downloaded successfully.');
      setSnackOpen(true);
    } catch (err) {
      console.error('Error generating ID card:', err);
      setSnackSeverity('error');
      setSnackMessage('Failed to download ID card.');
      setSnackOpen(true);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSnackClose = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
  };

  // Build the overlay content (photo + text) as a function
  const renderCardContents = (containerIsCapture) => {
    // Decide whether to use 96 DPI (on‐screen) or 300 DPI (capture) for positioning:
    const cmToPx = containerIsCapture ? cmToPx300 : cmToPx96;
    const PHOTO_DIAMETER_PX = cmToPx(PHOTO_DIAMETER_CM);
    const PHOTO_TOP_PX = cmToPx(PHOTO_TOP_CM);
    const PHOTO_LEFT_PX = containerIsCapture
      ? Math.round((TEMPLATE_WIDTH_PX - PHOTO_DIAMETER_PX) / 2)
      : cmToPx(PHOTO_LEFT_CM);

    const NAME_TOP_PX = cmToPx(NAME_TOP_CM);
    // const DESIGNATION_TOP_PX = cmToPx(DESIGNATION_TOP_CM);
    const CLUSTER_UNIT_TOP_PX = cmToPx(CLUSTER_UNIT_TOP_CM);

    return (
      <>
        {/* Photo Overlay */}
        {formData.photoPreview && (
          <Box
            component="img"
            src={formData.photoPreview}
            alt={`Photo of ${formData.name}`}
            sx={{
              position: 'absolute',
              top: `${PHOTO_TOP_PX}px`,
              left: `${PHOTO_LEFT_PX}px`,
              width: `${PHOTO_DIAMETER_PX}px`,
              height: `${PHOTO_DIAMETER_PX}px`,
              borderRadius: '15px',
              border: '2px solid #0288D1',
              objectFit: 'cover',
              backgroundColor: '#ffffff',
            }}
          />
        )}

<Box
  sx={{
    position: 'absolute',
    top: `${NAME_TOP_PX}px`, // position container at the name's top offset
    left: 0,
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px', // optional gap between name and designation
    overflow: 'hidden', // ensures that content does not spill out
    boxSizing: 'border-box',
  }}
>
  {/* Name Overlay */}
  <Typography
    sx={{
      width: '100%',
      fontSize: containerIsCapture
        ? `${cmToPx(0.35)}px`
        : `${cmToPx(0.35)}px`,
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 700,
      color: '#212121',
      textTransform: 'uppercase',
      textAlign: 'center',
      margin: 0,
      padding: 0,
    }}
  >
    {formData.name}
  </Typography>

  {/* Designation Overlay */}
  <Typography
    sx={{
      width: '100%',
      boxSizing: 'border-box', // include padding in the width calculation
      fontSize: containerIsCapture
        ? `${cmToPx(0.30)}px`
        : `${cmToPx(0.30)}px`,
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
      backgroundColor: '#0288D1', // Blue background
      color: '#ffffff',           // White text
      textTransform: 'capitalize',
      textAlign: 'center',
      padding: '4px 8px',
      borderRadius: '4px', // softly rounded edges
      margin: 0,
    }}
  >
    {formData.designation || formData.designations?.join(', ')}
  </Typography>
</Box>

        {/* Cluster – Unit Overlay */}
        <Typography
          sx={{
            position: 'absolute',
            top: `${CLUSTER_UNIT_TOP_PX}px`,
            left: 0,
            width: '100%',
            fontSize: containerIsCapture
              ? `${cmToPx(0.28)}px`
              : `${cmToPx(0.28)}px`,
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 400,
            color: '#424242',
            textTransform: 'capitalize',
            textAlign: 'center',
          }}
        >
          {formData.cluster} – {formData.unit}
        </Typography>
      </>
    );
  };

  return (
    <Container
      maxWidth="md"
      sx={{
        mt: 4,
        mb: 4,
        textAlign: 'center',
        backgroundColor: '#F0F2F5',
        py: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* ========== ON‐SCREEN PREVIEW ========== */}
      <Box
        ref={previewRef}
        sx={{
          position: 'relative',
          width: '5.9cm',   // 5.9 cm on‐screen
          height: '8.4cm',  // 8.4 cm on‐screen
          backgroundImage: 'url("/idcard-template.png")',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          border: '1px solid #ccc',
        }}
      >
        {renderCardContents(false /* on-screen mode */)}
      </Box>

      {/* ========== HIDDEN CAPTURE LAYER ========== */}
      <Box
        ref={captureContainerRef}
        sx={{
          position: 'absolute',
          top: '-10000px',  // push far off-screen
          left: '-10000px',
          width: `${TEMPLATE_WIDTH_PX}px`,
          height: `${TEMPLATE_HEIGHT_PX}px`,
          backgroundImage: 'url("/idcard-template.png")',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          overflow: 'hidden',
        }}
      >
        {renderCardContents(true /* capture mode */)}
      </Box>

      {/* ========== DOWNLOAD BUTTON ========== */}
      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleDownload}
          disabled={isDownloading}
          startIcon={isDownloading ? <CircularProgress size={20} color="inherit" /> : null}
          sx={{
            textTransform: 'none',
            backgroundColor: '#0288D1',
            '&:hover': { backgroundColor: '#0277BD' },
            color: '#fff',
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 500,
            fontSize: '0.9rem',
            px: 3,
            py: 1,
          }}
        >
          {isDownloading ? 'Generating...' : 'Download ID Card'}
        </Button>
      </Box>

      {/* ========== SNACKBAR ========== */}
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
}

export default IDCard;

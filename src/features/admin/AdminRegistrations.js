// src/features/admin/AdminRegistrations.js

import React, { useEffect, useState, useCallback } from 'react';
import { API_BASE_URL } from '../../config';
import {
  Container,
  Typography,
  Box,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';

// Define clusters and units mapping (matching RegistrationForm)
const clusters = ['Kunthoor', 'Mardala'];
const unitsByCluster = {
  Kunthoor: ['Kadaba', 'Kunthoor', 'Kalara', 'Nekkare', 'Kodimbala', 'Korundoor'],
  Mardala: ['Panya', 'Mardala', 'Sunkadakatte', 'Nettana', 'Kallaje'],
};

const AdminRegistrations = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editingReg, setEditingReg] = useState(null);
  const [editName, setEditName] = useState('');
  const [editCluster, setEditCluster] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editDesignations, setEditDesignations] = useState('');

  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('success');

  // Fetch registrations (extracted for reuse in retry)
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

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this registration?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/registration/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.message || 'Delete failed');
      }
      setRegistrations((prev) => prev.filter((r) => r._id !== id));
      setSnackSeverity('success');
      setSnackMessage('Registration deleted successfully');
      setSnackOpen(true);
    } catch (err) {
      console.error(err);
      setSnackSeverity('error');
      setSnackMessage(`Error deleting: ${err.message}`);
      setSnackOpen(true);
    }
  };

  const openEditModal = (reg) => {
    setEditingReg(reg);
    setEditName(reg.name);
    setEditCluster(reg.cluster);
    setEditUnit(reg.unit);
    setEditDesignations(reg.designations.join(', '));
  };

  const closeEditModal = () => {
    setEditingReg(null);
    setEditName('');
    setEditCluster('');
    setEditUnit('');
    setEditDesignations('');
  };

  const handleSaveEdit = async () => {
    if (!editingReg) return;

    const updatedData = {
      name: editName.trim(),
      cluster: editCluster.trim(),
      unit: editUnit.trim(),
      designations: editDesignations
        .split(',')
        .map((item) => item.trim())
        .filter((item) => item),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/api/registration/${editingReg._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Update failed');
      setRegistrations((prev) =>
        prev.map((r) => (r._id === editingReg._id ? result.data : r))
      );
      setSnackSeverity('success');
      setSnackMessage('Registration updated successfully');
      setSnackOpen(true);
      closeEditModal();
    } catch (err) {
      console.error(err);
      setSnackSeverity('error');
      setSnackMessage(`Error updating: ${err.message}`);
      setSnackOpen(true);
    }
  };

  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackOpen(false);
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

  // Download Registrations PDF (A4) via fetch → Blob → anchor
  const handleDownloadRegistrations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/export/registrations`, {
        method: 'GET',
        headers: { Accept: 'application/pdf' },
      });
      if (!response.ok) {
        throw new Error(`Server responded ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link to trigger download
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'registrations.pdf';
      document.body.appendChild(anchor);
      anchor.click();

      // Cleanup
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading registrations PDF:', err);
      setSnackSeverity('error');
      setSnackMessage('Failed to download registrations PDF.');
      setSnackOpen(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Registrations
      </Typography>

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
          }}
        >
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
      ) : (
        <Paper elevation={3}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 150 }}>Name</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Cluster</TableCell>
                  <TableCell sx={{ minWidth: 100 }}>Unit</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Designations</TableCell>
                  <TableCell sx={{ minWidth: 80 }}>Photo</TableCell>
                  <TableCell sx={{ minWidth: 160 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {registrations.map((reg) => {
                  const photoSrc = getPhotoSrc(reg.photoUrl);
                  return (
                    <TableRow key={reg._id} hover>
                      <TableCell>{reg.name}</TableCell>
                      <TableCell>{reg.cluster}</TableCell>
                      <TableCell>{reg.unit}</TableCell>
                      <TableCell>{reg.designations.join(', ')}</TableCell>
                      <TableCell>
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={reg.name}
                            style={{ width: 50, borderRadius: 4 }}
                          />
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => openEditModal(reg)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDelete(reg._id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ p: 2, textAlign: 'right' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#5A827E',
                '&:hover': { backgroundColor: '#46566A' },
                textTransform: 'none',
              }}
              onClick={handleDownloadRegistrations}
            >
              Download Registrations PDF (A4)
            </Button>
          </Box>
        </Paper>
      )}

      {/* Edit Modal */}
      <Dialog open={Boolean(editingReg)} onClose={closeEditModal} fullWidth maxWidth="sm">
        <DialogTitle>Edit Registration</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            sx={{
              mt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              margin="dense"
              label="Name"
              fullWidth
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>Cluster</InputLabel>
              <Select
                value={editCluster}
                label="Cluster"
                onChange={(e) => {
                  setEditCluster(e.target.value);
                  setEditUnit(''); // reset unit when cluster changes
                }}
              >
                {clusters.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" disabled={!editCluster}>
              <InputLabel>Unit</InputLabel>
              <Select
                value={editUnit}
                label="Unit"
                onChange={(e) => setEditUnit(e.target.value)}
              >
                {editCluster &&
                  unitsByCluster[editCluster].map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            <TextField
              margin="dense"
              label="Designations (comma separated)"
              fullWidth
              value={editDesignations}
              onChange={(e) => setEditDesignations(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEditModal}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

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

export default AdminRegistrations;

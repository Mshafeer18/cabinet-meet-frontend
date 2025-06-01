import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Button,
  Chip,
  FormHelperText,
  Avatar,
} from '@mui/material';

const clusters = ['Kunthoor', 'Mardala'];
const unitsByCluster = {
  Kunthoor: ['Kadaba', 'Kunthoor', 'Kalara', 'Nekkare', 'Kodimbala', 'Korundoor'],
  Mardala: ['Panya', 'Mardala', 'Sunkadakatte', 'Nettana', 'Kallaje'],
};
const designationOptions = [
  'Unit President',
  'Unit General Secretary',
  'Unit Treasurer',
  'Cluster President',
  'Cluster General Secretary',
  'Cluster Treasurer',
  'Sub Wing Chairman',
  'Sub Wing Convenor',
  'Zone Councilor',
];

function RegistrationForm({ onSubmit, initialData = {} }) {
  const [name, setName] = useState('');
  const [cluster, setCluster] = useState('');
  const [unit, setUnit] = useState('');
  const [designations, setDesignations] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setName(initialData.name || '');
    setCluster(initialData.cluster || '');
    setUnit(initialData.unit || '');
    setDesignations(initialData.designations || []);
    setPhotoPreview(initialData.photoPreview || '');
    setErrors({});
  }, [initialData]);

  useEffect(() => {
    setUnit('');
    setErrors(prev => ({ ...prev, unit: undefined }));
  }, [cluster]);

  const handleDesignationChange = e => {
    const { value } = e.target;
    setDesignations(typeof value === 'string' ? value.split(',') : value);
    setErrors(prev => ({ ...prev, designations: undefined }));
  };

  const handlePhotoChange = e => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, photo: undefined }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!cluster) newErrors.cluster = 'Cluster is required';
    if (!unit) newErrors.unit = 'Unit is required';
    if (!designations.length) newErrors.designations = 'Select at least one designation';
    if (!photo) newErrors.photo = 'Photo is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ name: name.trim(), cluster, unit, designations, photo, photoPreview });
  };

  return (
    <Box
      sx={{
        backgroundColor: '#B9D4AA',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{ p: 4, mt: 4, backgroundColor: '#FAFFCA', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)' }}
        >
          <Box>
          <Typography variant="h5" align="center" sx={{ color: '#5A827E', fontWeight: 'bold' }}>
            ANNUAL CABINET MEET - 2025
          </Typography>
          <Typography variant="h6" align="center" gutterBottom sx={{ color: '#5A827E'}}>
            REGISTRATION
          </Typography>
          </Box>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={name}
              onChange={e => { setName(e.target.value); errors.name && setErrors(prev => ({ ...prev, name: undefined })); }}
              error={!!errors.name}
              helperText={errors.name}
              required
              autoFocus
              sx={{
                // Change label color when focused
                '& label.Mui-focused': {
                color: '#5A827E',
                },
                // Change border color when focused (for outlined variant)
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': {
                   borderColor: '#5A827E',
                  },
                },
              }}
            />

            <FormControl fullWidth error={!!errors.cluster} required
            sx={{
              // Style for the InputLabel when focused
              '& .MuiInputLabel-root.Mui-focused': {
              color: '#5A827E',
              },
              // Style for the border when the input is focused (works for outlined inputs)
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: '#5A827E',
              },
            }}
            >
              <InputLabel>Cluster</InputLabel>
              <Select
                value={cluster}
                label="Cluster"
                onChange={e => { setCluster(e.target.value); 
                if (errors.cluster) {
                setErrors(prev => ({ ...prev, cluster: undefined }));
                }
                }}
                MenuProps={{
                PaperProps: {
                sx: {
                backgroundColor: '#FAFFCA', // sets the background for the dropdown menu
                },
                },
                }}
              >
                {clusters.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.cluster}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.unit} required
            sx={{
              // Style for the InputLabel when focused
              '& .MuiInputLabel-root.Mui-focused': {
              color: '#5A827E',
              },
              // Style for the border when the input is focused (works for outlined inputs)
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: '#5A827E',
              },
            }}
            >
              <InputLabel>Unit</InputLabel>
              <Select
                value={unit}
                label="Unit"
                onChange={e => { setUnit(e.target.value);  
                if (errors.cluster) {
                setErrors(prev => ({ ...prev, cluster: undefined }));
                }
                }}
                MenuProps={{
                PaperProps: {
                sx: {
                backgroundColor: '#FAFFCA', // sets the background for the dropdown menu
                },
                },
                }}
              >
                {cluster && unitsByCluster[cluster].map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.unit}</FormHelperText>
            </FormControl>

            <FormControl fullWidth error={!!errors.designations} required
            sx={{
              // Style for the InputLabel when focused
              '& .MuiInputLabel-root.Mui-focused': {
              color: '#5A827E',
              },
              // Style for the border when the input is focused (works for outlined inputs)
              '& .MuiOutlinedInput-root.Mui-focused fieldset': {
              borderColor: '#5A827E',
              },
            }}>
              <InputLabel>Designations</InputLabel>
              <Select
                multiple
                value={designations}
                onChange={handleDesignationChange}
                input={<OutlinedInput label="Designations" />}
                renderValue={selected => (
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {selected.map(val => <Chip key={val} label={val} />)}
                  </Box>
                )}
                MenuProps={{
                PaperProps: {
                sx: {
                backgroundColor: '#FAFFCA', // sets the background for the dropdown menu
                },
                },
                }}
              >
                {designationOptions.map(opt => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
              </Select>
              <FormHelperText>{errors.designations}</FormHelperText>
            </FormControl>

            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              {photoPreview ? (
                <Avatar src={photoPreview} sx={{ width: 80, height: 80, border: '1px solid #5A827E', }} />
              ) : (
                <Avatar sx={{ width: 80, height: 80, bgcolor: '#5A827E', border: '1px solid #5A827E', }} />
              )}
              <Button
                variant="outlined"
                component="label"
                sx={{ textTransform: 'none', borderColor: '#5A827E', // Outlined button border color
                  color: '#5A827E', // Button text color
                 '&:hover': {
                  borderColor: '#5A827E',
                  backgroundColor: 'rgba(90, 130, 126, 0.08)', // Optional subtle hover background
                },}}
                >
                {photo ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" hidden onChange={handlePhotoChange} />
              </Button>
            </Box>
            {errors.photo && <FormHelperText error>{errors.photo}</FormHelperText>}

            <Button
              variant="contained"
              type="submit"
              fullWidth
              disabled={!name.trim() || !cluster || !unit || !designations.length || !photo}
              sx={{ py: 1.5, backgroundColor: '#5A827E' }}
            >
              Submit
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default RegistrationForm;

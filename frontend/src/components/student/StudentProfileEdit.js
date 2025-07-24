import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { updateStudentProfile } from '../../redux/userRelated/userHandle';

const StudentProfileEdit = () => {
  const dispatch = useDispatch();
  const { currentUser, status } = useSelector((state) => state.user);
  
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ show: false, text: '', severity: 'success' });
  
  const [formData, setFormData] = useState({
    dateOfBirth: null,
    gender: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: ''
  });

  // Load student data when component mounts or currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData({
        dateOfBirth: currentUser.dateOfBirth ? new Date(currentUser.dateOfBirth) : null,
        gender: currentUser.gender || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        emergencyContact: currentUser.emergencyContact || ''
      });
    }
  }, [currentUser]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dateOfBirth: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare the data for submission
      const submissionData = {
        ...formData,
        // Format date to ISO string if it exists
        dateOfBirth: formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null
      };

      // Dispatch the update action
      const result = await dispatch(updateStudentProfile(currentUser._id, submissionData));
      
      if (result && result.success) {
        setMessage({
          show: true,
          text: 'Profile updated successfully!',
          severity: 'success'
        });
        handleClose();
      } else {
        setMessage({
          show: true,
          text: 'Failed to update profile. Please try again.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({
        show: true,
        text: 'An error occurred while updating profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setMessage({ ...message, show: false });
  };

  return (
    <>
      <Box display="flex" justifyContent="center" mt={2}>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={handleOpen}
          sx={{ 
            backgroundColor: '#7f56da', 
            '&:hover': { backgroundColor: '#5e35b1' } 
          }}
        >
          Edit Profile
        </Button>
      </Box>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#f5f5f5', color: '#333' }}>
          Edit Your Profile
        </DialogTitle>
        <DialogContent>
          <Box component="form" noValidate sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}                    onChange={handleDateChange}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    label="Gender"
                  >
                    <MenuItem value="">
                      <em>Prefer not to say</em>
                    </MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  type="email"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={2}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Emergency Contact"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  helperText="Phone number of a family member or close friend"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
            sx={{ 
              backgroundColor: '#7f56da', 
              '&:hover': { backgroundColor: '#5e35b1' } 
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={message.show} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={message.severity}>
          {message.text}
        </Alert>
      </Snackbar>
    </>
  );
};

export default StudentProfileEdit;

import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';

const bloodTypes = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
];

const genders = [
  { value: 'male', label: 'Nam' },
  { value: 'female', label: 'Nữ' },
  { value: 'other', label: 'Khác' }
];

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required'),
  lastName: Yup.string()
    .required('Last name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'Phone number must be 10 digits')
    .required('Phone number is required'),
  bloodType: Yup.string()
    .oneOf(bloodTypes, 'Invalid blood type')
    .required('Blood type is required'),
  address: Yup.string()
    .required('Address is required'),
  idCard: Yup.string()
    .matches(/^[0-9]{12}$/, 'ID Card must be 12 digits')
    .required('ID Card is required'),
  gender: Yup.string()
    .oneOf(['male', 'female', 'other'], 'Invalid gender')
    .required('Gender is required'),
});

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      bloodType: '',
      address: '',
      idCard: '',
      gender: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(register(values)).unwrap();
        navigate('/');
      } catch (err) {
        // Error is handled by the auth slice
      }
    },
  });

  return (
    <Box sx={{
      minHeight: '100vh',
      minWidth: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/assets/1.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 0
    }}>
      {/* Banner logo */}
      <Box sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: 70,
        bgcolor: 'rgba(255,255,255,0.95)',
        display: 'flex',
        alignItems: 'center',
        px: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        zIndex: 2
      }}>
        <Link component={RouterLink} to="/Home" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ height: 48, width: 48, borderRadius: 8, objectFit: 'cover', marginRight: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', letterSpacing: 1 }}>
            Blood Donation
          </Typography>
        </Link>
      </Box>
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ 
        width: '100%', 
        maxWidth: 450, 
        bgcolor: 'rgba(255,255,255,0.97)', 
        p: 3, 
        borderRadius: 4, 
        boxShadow: '0 8px 32px rgba(229,57,53,0.15)', 
        zIndex: 1 
      }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom sx={{ mb: 2 }}>
          Sign Up
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              id="firstName"
              name="firstName"
              label="First Name"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              error={formik.touched.firstName && Boolean(formik.errors.firstName)}
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              id="lastName"
              name="lastName"
              label="Last Name"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
        </Grid>

        <TextField
          fullWidth
          size="small"
          id="email"
          name="email"
          label="Email Address"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="dense"
        />

        <TextField
          fullWidth
          size="small"
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="dense"
        />

        <TextField
          fullWidth
          size="small"
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm Password"
          type="password"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
          helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          margin="dense"
        />

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              id="phoneNumber"
              name="phoneNumber"
              label="Phone Number"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              error={formik.touched.phoneNumber && Boolean(formik.errors.phoneNumber)}
              helperText={formik.touched.phoneNumber && formik.errors.phoneNumber}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              id="bloodType"
              name="bloodType"
              select
              label="Blood Type"
              value={formik.values.bloodType}
              onChange={formik.handleChange}
              error={formik.touched.bloodType && Boolean(formik.errors.bloodType)}
              helperText={formik.touched.bloodType && formik.errors.bloodType}
            >
              {bloodTypes.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <TextField
          fullWidth
          size="small"
          id="address"
          name="address"
          label="Address"
          value={formik.values.address}
          onChange={formik.handleChange}
          error={formik.touched.address && Boolean(formik.errors.address)}
          helperText={formik.touched.address && formik.errors.address}
          margin="dense"
        />

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              id="idCard"
              name="idCard"
              label="Số CCCD"
              value={formik.values.idCard}
              onChange={formik.handleChange}
              error={formik.touched.idCard && Boolean(formik.errors.idCard)}
              helperText={formik.touched.idCard && formik.errors.idCard}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="gender-label">Giới tính</InputLabel>
              <Select
                labelId="gender-label"
                id="gender"
                name="gender"
                value={formik.values.gender}
                onChange={formik.handleChange}
                label="Giới tính"
                error={formik.touched.gender && Boolean(formik.errors.gender)}
              >
                {genders.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 2, mb: 1.5 }}
          disabled={loading}
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/login" variant="body2">
            {"Already have an account? Sign In"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup; 
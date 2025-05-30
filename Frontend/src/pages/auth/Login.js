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
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../features/auth/authSlice';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
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
        <Link component={RouterLink} to="/home" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/assets/logo.png" alt="Logo" style={{ height: 48, width: 48, borderRadius: 8, objectFit: 'cover', marginRight: 16 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#e53935', letterSpacing: 1 }}>
            Blood Donation
          </Typography>
        </Link>
      </Box>
      {/* Form đăng nhập */}
      <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', maxWidth: 400, bgcolor: 'rgba(255,255,255,0.97)', p: 5, borderRadius: 4, boxShadow: '0 8px 32px rgba(229,57,53,0.15)', zIndex: 1, mt: 10 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Sign In
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <TextField
          fullWidth
          id="email"
          name="email"
          label="Email Address"
          value={formik.values.email}
          onChange={formik.handleChange}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
          margin="normal"
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Password"
          type="password"
          value={formik.values.password}
          onChange={formik.handleChange}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/signup" variant="body2">
            {"Don't have an account? Sign Up"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 
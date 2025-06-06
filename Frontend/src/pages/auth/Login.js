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
      // Test user login
      if (values.email === 'user@gmail.com' && values.password === '123456') {
        const testUser = {
          email: 'user@gmail.com',
          // Mock detailed signup data
          idType: 'Căn cước công dân',
          citizenId: '123456789012',
          firstName: 'Test', // Split from full name
          lastName: 'User', // Split from full name
          dateOfBirth: '1990-01-15', // YYYY-MM-DD
          gender: 'Nam',
          city: 'Hà Nội',
          district: 'Đống Đa',
          ward: 'Phường Trung Liệt',
          address: 'Số 123, Đường ABC, Phường Trung Liệt, Quận Đống Đa, Hà Nội', // Combined address
          phoneNumber: '0987654321',
          occupation: 'Kỹ sư',
          landlinePhone: '02438512345',
          bloodType: 'A+', // Adding blood type as a common profile field
          // image: null, // If image is part of profile
        };
        localStorage.setItem('userProfile', JSON.stringify(testUser));
        localStorage.setItem('isAuthenticated', 'true'); // Assuming you use this flag
        localStorage.setItem('isTestUser', 'true'); // Flag for test user
        navigate('/');
        return;
      }

      // Existing login logic for real users
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
      backgroundImage: 'url(/images/Login.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#fff',
        px: 4,
        height: 70,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        zIndex: 2,
        justifyContent: 'center',
      }}>
        <Link component={RouterLink} to="/home" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.png" alt="logo" style={{ height: 40, marginRight: 8 }} />
          <Typography variant="h5" fontWeight="bold" color="#e53935" sx={{ letterSpacing: 2 }}>
            Hệ Thống Hỗ Trợ Hiến Máu
          </Typography>
        </Link>
      </Box>
      {/* Form đăng nhập */}
      <Box component="form" onSubmit={formik.handleSubmit} sx={{
        width: '100%',
        maxWidth: 400,
        bgcolor: 'rgba(255,255,255,0.97)',
        p: 5,
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(229,57,53,0.15)',
        zIndex: 1,
        marginTop: 4,
        marginBottom: 4,
        mx: 'auto',
      }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Đăng Nhập 
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
          label="Tài Khoản"
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
          label="Mật Khẩu"
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
          {loading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/signup" variant="body2">
            {"Chưa có tìa khoản? Đăng Ký"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 
import React, { useEffect } from 'react';
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
  Stack,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginThunk } from '../../features/auth/authSlice';
import { useState } from 'react'; // Import useState

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api'; // Sử dụng cùng API_URL với authSlice

const validationSchema = Yup.object({
  citizenId: Yup.string()
    .matches(/^\d{12}$/, 'CCCD phải gồm 12 số')
    .required('Số CCCD là bắt buộc'),
  password: Yup.string()
    .required('Mật khẩu là bắt buộc'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);
  const [showLocationAlert, setShowLocationAlert] = React.useState(false); // State để quản lý Alert

  const formik = useFormik({
    initialValues: {
      citizenId: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const resultAction = await dispatch(loginThunk(values)).unwrap();
        const userId = resultAction.userId; // Lấy userId từ kết quả đăng nhập
        const token = resultAction.token; // Lấy token từ kết quả đăng nhập

        // Sau khi đăng nhập thành công, cố gắng lấy và cập nhật vị trí
        if (userId && token) {
          try {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  const { latitude, longitude } = position.coords;
                  console.log('Vị trí được lấy:', latitude, longitude);
                  try {
                    await fetch(`${API_BASE_URL}/User/${userId}/location`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ latitude, longitude }),
                    });
                    console.log('Vị trí đã được cập nhật thành công trên backend.');
                  } catch (error) {
                    console.error('Lỗi khi cập nhật vị trí lên backend:', error);
                  }
                },
                (error) => {
                  // Xử lý lỗi khi người dùng từ chối hoặc có vấn đề khác
                  console.error('Lỗi khi lấy vị trí:', error);
                  if (error.code === error.PERMISSION_DENIED) {
                    setShowLocationAlert(true); // Hiển thị Alert khi từ chối
                  } else {
                    // Các lỗi khác (ví dụ: timeout)
                    // Có thể hiển thị một thông báo khác nếu cần
                  }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            } else {
              console.log('Trình duyệt không hỗ trợ Geolocation.');
              // Có thể hiển thị Alert nếu trình duyệt không hỗ trợ
            }
          } catch (geoInitErr) {
            console.error('Lỗi khởi tạo Geolocation:', geoInitErr);
          }
        }

        console.log('Kết quả đăng nhập:', resultAction);
        navigate('/');
      } catch (err) {
        // Error is handled by the auth slice
        console.error('Lỗi đăng nhập:', err);
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
          id="citizenId"
          name="citizenId"
          label="Số CCCD"
          value={formik.values.citizenId}
          onChange={formik.handleChange}
          error={formik.touched.citizenId && Boolean(formik.errors.citizenId)}
          helperText={formik.touched.citizenId && formik.errors.citizenId}
          margin="normal"
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Mật khẩu"
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
            {"Chưa có tài khoản? Đăng Ký"}
          </Link>
        </Box>
      </Box>

      {showLocationAlert && (
        <Alert severity="warning" onClose={() => setShowLocationAlert(false)} sx={{ mt: 2 }}>
          Bạn đã từ chối cấp quyền vị trí. Chức năng tìm kiếm người cần/hiến máu theo khoảng cách có thể không hoạt động chính xác.
        </Alert>
      )}
    </Box>
  );
};

export default Login; 
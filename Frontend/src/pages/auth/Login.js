import React, { useEffect, useState } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
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
  Snackbar,
  Alert as MuiAlert,
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginThunk, createTestAccount } from '../../features/auth/authSlice';
import { Visibility, VisibilityOff } from '@mui/icons-material';

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
  const location = useLocation();
  const dispatch = useDispatch();
  const { error: authError, loading } = useSelector((state) => state.auth);
  const [error, setError] = useState("");
  const [showLocationAlert, setShowLocationAlert] = React.useState(false); // State để quản lý Alert
  const [snackbar, setSnackbar] = React.useState({ open: false, message: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // ===== NGHIỆP VỤ: KIỂM TRA NGƯỜI DÙNG ĐÃ ĐĂNG NHẬP VÀ XỬ LÝ URGENT DONATION =====
  useEffect(() => {
    console.log('🔍 [DEBUG] useEffect triggered - checking authentication and urgent donation...');
    
    // Kiểm tra nếu người dùng đã đăng nhập
    const token = localStorage.getItem('token');
    const isAuthenticated = token !== null;
    
    console.log('🔍 [DEBUG] Token from localStorage:', token);
    console.log('🔍 [DEBUG] Is authenticated:', isAuthenticated);
    
    // Kiểm tra URL parameters cho urgent donation
    const urlParams = new URLSearchParams(window.location.search);
    const redirect = urlParams.get('redirect');
    const urgentRequestId = urlParams.get('urgentRequestId');
    const bloodType = urlParams.get('bloodType');

    console.log('🔍 [DEBUG] URL parameters:');
    console.log('  - redirect:', redirect);
    console.log('  - urgentRequestId:', urgentRequestId);
    console.log('  - bloodType:', bloodType);
    console.log('🔍 [DEBUG] Current URL:', window.location.href);

    // Nếu có thông tin urgent donation, lưu vào localStorage
    if (redirect && urgentRequestId && bloodType) {
      console.log('✅ [DEBUG] All urgent donation parameters found!');
      
      localStorage.setItem('redirectAfterLogin', redirect);
      localStorage.setItem('urgentRequestId', urgentRequestId);
      localStorage.setItem('bloodType', bloodType);
      
      console.log('💾 [DEBUG] Urgent donation info saved to localStorage');
      console.log('💾 [DEBUG] redirectAfterLogin:', localStorage.getItem('redirectAfterLogin'));
      console.log('💾 [DEBUG] urgentRequestId:', localStorage.getItem('urgentRequestId'));
      console.log('💾 [DEBUG] bloodType:', localStorage.getItem('bloodType'));
      
      // Nếu đã đăng nhập, chuyển hướng ngay lập tức
      if (isAuthenticated) {
        console.log('🚀 [DEBUG] User is authenticated, redirecting immediately...');
        console.log('🚀 [DEBUG] Navigating to:', redirect);
        
        try {
          navigate(redirect);
          console.log('✅ [DEBUG] Navigation called successfully');
        } catch (error) {
          console.error('❌ [DEBUG] Navigation error:', error);
        }
        return;
      } else {
        console.log('⚠️ [DEBUG] User not authenticated, will show login form');
      }
    } else {
      console.log('⚠️ [DEBUG] Missing urgent donation parameters:');
      console.log('  - redirect exists:', !!redirect);
      console.log('  - urgentRequestId exists:', !!urgentRequestId);
      console.log('  - bloodType exists:', !!bloodType);
    }
    
    // Nếu chưa đăng nhập, xóa token cũ
    if (!isAuthenticated) {
      console.log('🧹 [DEBUG] User not authenticated, cleaning up old tokens...');
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      console.log('🧹 [DEBUG] Cleanup completed');
    }
    
    console.log('🔍 [DEBUG] useEffect completed');
  }, [navigate]);

  useEffect(() => {
    if (authError) {
      setError(authError); // Luôn hiển thị lỗi từ backend
    }
  }, [authError]);

  useEffect(() => {
    setError(""); // Reset lỗi khi vào trang login
  }, []);

  // Hiển thị popup nếu có state từ trang Events
  React.useEffect(() => {
    if (location.state && location.state.popup) {
      setSnackbar({ open: true, message: location.state.popupMessage || 'Bạn cần đăng nhập để tiếp tục!' });
    }
  }, [location.state]);

  useEffect(() => {
    if (localStorage.getItem('showLoginSnackbar') === 'true') {
      setOpenSnackbar(true);
      localStorage.removeItem('showLoginSnackbar');
    }
  }, []);



  const formik = useFormik({
    initialValues: {
      citizenId: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      console.log('🔍 [DEBUG] Login form submitted with:', values);
      try {
        console.log('🔍 [DEBUG] Dispatching login thunk...');
        const resultAction = await dispatch(loginThunk(values)).unwrap();
        console.log('✅ [DEBUG] Login successful:', resultAction);
        
        const userId = resultAction.userId;
        const token = resultAction.token;
        
        // Lưu role vào localStorage
        if (resultAction.role) {
          localStorage.setItem('role', resultAction.role);
          console.log('💾 [DEBUG] Role saved to localStorage:', resultAction.role);
        }
        // Lưu userId vào localStorage cho các chức năng khác
        localStorage.setItem('user', JSON.stringify({ UserId: userId, ...resultAction }));
        console.log('💾 [DEBUG] User info saved to localStorage');

        // Sau khi đăng nhập thành công, cố gắng lấy và cập nhật vị trí
        if (userId && token) {
          console.log('Bắt đầu cập nhật vị trí...');
          try {
            if (navigator.geolocation) {
              // Thêm timeout cho geolocation để tránh bị kẹt
              const geoTimeout = setTimeout(() => {
                console.log('Geolocation timeout - tiếp tục chuyển hướng');
                                 // Tiếp tục chuyển hướng ngay cả khi geolocation timeout
                 const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
                 console.log('🔍 [DEBUG] After login - redirectAfterLogin from localStorage:', redirectAfterLogin);
                 if (redirectAfterLogin) {
                   localStorage.removeItem('redirectAfterLogin');
                   console.log('🚀 [DEBUG] Redirecting to urgent donation after login:', redirectAfterLogin);
                   navigate(redirectAfterLogin);
                 } else {
                   console.log('🚀 [DEBUG] Redirecting to home page after login');
                   navigate('/');
                 }
              }, 5000); // 5 giây timeout

              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  clearTimeout(geoTimeout); // Clear timeout nếu thành công
                  const { latitude, longitude } = position.coords;
                  console.log('Vị trí được lấy:', latitude, longitude);
                  try {
                    const response = await fetch(`${API_BASE_URL}/User/${userId}/location`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                      },
                      body: JSON.stringify({ latitude, longitude }),
                    });
                    
                    if (response.ok) {
                      console.log('Vị trí đã được cập nhật thành công trên backend.');
                    } else {
                      console.error('Lỗi khi cập nhật vị trí:', response.status, response.statusText);
                    }
                  } catch (error) {
                    console.error('Lỗi khi cập nhật vị trí lên backend:', error);
                  }
                  
                  // Chuyển hướng sau khi xử lý vị trí
                  const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
                  console.log('🔍 [DEBUG] After geolocation success - redirectAfterLogin:', redirectAfterLogin);
                  if (redirectAfterLogin) {
                    localStorage.removeItem('redirectAfterLogin');
                    console.log('🚀 [DEBUG] Redirecting to urgent donation after geolocation:', redirectAfterLogin);
                    navigate(redirectAfterLogin);
                  } else {
                    console.log('🚀 [DEBUG] Redirecting to home page after geolocation');
                    navigate('/');
                  }
                },
                (error) => {
                  clearTimeout(geoTimeout); // Clear timeout nếu có lỗi
                  // Xử lý lỗi khi người dùng từ chối hoặc có vấn đề khác
                  console.error('Lỗi khi lấy vị trí:', error);
                  if (error.code === error.PERMISSION_DENIED) {
                    setShowLocationAlert(true); // Hiển thị Alert khi từ chối
                  } else {
                    // Các lỗi khác (ví dụ: timeout)
                    // Có thể hiển thị một thông báo khác nếu cần
                  }
                  
                  // Chuyển hướng ngay cả khi có lỗi geolocation
                  const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
                  console.log('🔍 [DEBUG] After geolocation error - redirectAfterLogin:', redirectAfterLogin);
                  if (redirectAfterLogin) {
                    localStorage.removeItem('redirectAfterLogin');
                    console.log('🚀 [DEBUG] Redirecting to urgent donation after geolocation error:', redirectAfterLogin);
                    navigate(redirectAfterLogin);
                  } else {
                    console.log('🚀 [DEBUG] Redirecting to home page after geolocation error');
                    navigate('/');
                  }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            } else {
              console.log('Trình duyệt không hỗ trợ Geolocation.');
              // Chuyển hướng ngay lập tức nếu không hỗ trợ geolocation
              const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
              console.log('🔍 [DEBUG] No geolocation support - redirectAfterLogin:', redirectAfterLogin);
              if (redirectAfterLogin) {
                localStorage.removeItem('redirectAfterLogin');
                console.log('🚀 [DEBUG] Redirecting to urgent donation (no geolocation):', redirectAfterLogin);
                navigate(redirectAfterLogin);
              } else {
                console.log('🚀 [DEBUG] Redirecting to home page (no geolocation)');
                navigate('/');
              }
            }
          } catch (geoInitErr) {
            console.error('Lỗi khởi tạo Geolocation:', geoInitErr);
            // Chuyển hướng ngay cả khi có lỗi khởi tạo geolocation
            const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
            console.log('🔍 [DEBUG] Geolocation init error - redirectAfterLogin:', redirectAfterLogin);
            if (redirectAfterLogin) {
              localStorage.removeItem('redirectAfterLogin');
              console.log('🚀 [DEBUG] Redirecting to urgent donation (geolocation init error):', redirectAfterLogin);
              navigate(redirectAfterLogin);
            } else {
              console.log('🚀 [DEBUG] Redirecting to home page (geolocation init error)');
              navigate('/');
            }
          }
        } else {
          // Nếu không có userId hoặc token, chuyển hướng ngay
          const redirectAfterLogin = localStorage.getItem('redirectAfterLogin');
          console.log('🔍 [DEBUG] No userId/token - redirectAfterLogin:', redirectAfterLogin);
          if (redirectAfterLogin) {
            localStorage.removeItem('redirectAfterLogin');
            console.log('🚀 [DEBUG] Redirecting to urgent donation (no userId/token):', redirectAfterLogin);
            navigate(redirectAfterLogin);
          } else {
            console.log('🚀 [DEBUG] Redirecting to home page (no userId/token)');
            navigate('/');
          }
        }

        console.log('Kết quả đăng nhập:', resultAction);
      } catch (err) {
        // Error is handled by the auth slice
        console.error('Lỗi đăng nhập:', err);
        console.error('Chi tiết lỗi:', err.message);
        console.error('Stack trace:', err.stack);
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
        {/* Hiển thị lỗi ngay dưới ô mật khẩu */}
        {error && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, mb: 2 }}>
            <Alert 
              severity="error" 
              variant="outlined"
              icon={false}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                px: 1.5,
                py: 0.5,
                borderRadius: 2,
                fontSize: 13,
                borderColor: '#f44336',
                bgcolor: '#fdf3f3', // nền đỏ nhạt
                minWidth: 'unset',
                boxShadow: 'none',
                m: 0
              }}
            >
              {error}
            </Alert>
          </Box>
        )}
        <TextField
          fullWidth
          id="citizenId"
          name="citizenId"
          label="Số CCCD"
          value={formik.values.citizenId}
          onChange={e => {
            formik.setFieldValue('citizenId', e.target.value);
            setError(""); // Reset lỗi khi nhập lại
          }}
          error={formik.touched.citizenId && Boolean(formik.errors.citizenId)}
          helperText={formik.touched.citizenId && formik.errors.citizenId}
          margin="normal"
        />
        <TextField
          fullWidth
          id="password"
          name="password"
          label="Mật khẩu"
          type={showPassword ? 'text' : 'password'}
          value={formik.values.password}
          onChange={e => {
            formik.setFieldValue('password', e.target.value);
            setError(""); // Reset lỗi khi nhập lại
          }}
          error={formik.touched.password && Boolean(formik.errors.password)}
          helperText={formik.touched.password && formik.errors.password}
          margin="normal"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            ),
          }}
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
          <Typography
            component="span"
            variant="body2"
            sx={{ cursor: 'pointer', color: '#e53935', textDecoration: 'underline' }}
            onClick={() => window.location.href = '/signup'}
          >
            Chưa có tài khoản? Đăng Ký
          </Typography>
        </Box>
      </Box>

      {showLocationAlert && (
        <Alert severity="warning" onClose={() => setShowLocationAlert(false)} sx={{ mt: 2 }}>
          Bạn đã từ chối cấp quyền vị trí. Chức năng tìm kiếm người cần/hiến máu theo khoảng cách có thể không hoạt động chính xác.
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert severity="warning" sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={1200}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: '70px' }} // Nhích xuống dưới header (giả sử header cao 70px)
      >
        <MuiAlert elevation={6} variant="filled" severity="warning" sx={{ fontSize: '1rem' }}>
          Vui lòng đăng nhập để đặt lịch
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default Login;
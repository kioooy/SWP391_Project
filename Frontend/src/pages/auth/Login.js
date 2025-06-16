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
  Stack,
  Divider,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { login as loginThunk } from '../../features/auth/authSlice';

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

  const handleStaffLogin = () => {
    // Xóa các trạng thái đăng nhập cũ
    localStorage.removeItem("isTestUser");
    localStorage.removeItem("testUserData");
    
    // Thiết lập trạng thái staff
    localStorage.setItem("isStaff", "true");
    localStorage.setItem("isTestUser", "true");
    
    // Tạo dữ liệu staff
    const staffData = {
      id: "STAFF001",
      fullName: "Nhân Viên Staff",
      citizenNumber: "987654321098",
      role: "staff",
      position: "Nhân viên quản lý",
      department: "Phòng Hiến máu",
      email: "staff@example.com",
      phoneNumber: "0987654321"
    };
    localStorage.setItem("staffData", JSON.stringify(staffData));
    
    navigate("/");
  };

  const handleTestUserLogin = () => {
    // Xóa các trạng thái đăng nhập cũ
    localStorage.removeItem("isStaff");
    localStorage.removeItem("staffData");
    
    // Thiết lập trạng thái test user
    localStorage.setItem("isTestUser", "true");
    
    // Tạo dữ liệu test user
    const testUserData = {
      id: "TEST001",
      fullName: "Nguyễn Văn Test",
      citizenNumber: "123456789012",
      password: "Test@123",
      bloodType: "A+",
      dateOfBirth: "1990-01-01",
      gender: "Nam",
      address: "123 Đường Test, Quận 1, TP.HCM",
      phoneNumber: "0123456789",
      email: "test@example.com",
      lastDonationDate: "2024-01-01",
      nextDonationDate: "2024-07-01",
      donationHistory: [
        {
          id: 1,
          date: "2024-01-01",
          location: "Bệnh viện Chợ Rẫy",
          bloodType: "A+",
          volume: 350,
          status: "completed"
        },
        {
          id: 2,
          date: "2023-07-01",
          location: "Bệnh viện 115",
          bloodType: "A+",
          volume: 350,
          status: "completed"
        }
      ]
    };
    localStorage.setItem("testUserData", JSON.stringify(testUserData));
    navigate("/");
  };

  const formik = useFormik({
    initialValues: {
      citizenId: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Kiểm tra nếu là tài khoản test
        if (values.citizenId === "123456789012" && values.password === "Test@123") {
          handleTestUserLogin();
          return;
        }
        
        // Kiểm tra nếu là tài khoản staff
        if (values.citizenId === "987654321098" && values.password === "Staff@123") {
          handleStaffLogin();
          return;
        }
        
        // Nếu không phải tài khoản test hoặc staff, thực hiện đăng nhập thông thường
        await dispatch(loginThunk(values)).unwrap();
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
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Tài khoản test:</strong><br />
            CCCD: 123456789012<br />
            Mật khẩu: Test@123<br /><br />
            <strong>Tài khoản staff:</strong><br />
            CCCD: 987654321098<br />
            Mật khẩu: Staff@123
          </Typography>
        </Alert>
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
        <Divider sx={{ my: 2 }}>hoặc</Divider>
        <Stack spacing={2}>
          <Button
            fullWidth
            variant="outlined"
            color="primary"
            onClick={handleStaffLogin}
          >
            Đăng nhập với tài khoản Staff
          </Button>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={handleTestUserLogin}
          >
            Đăng nhập với tài khoản Test
          </Button>
        </Stack>
        <Box sx={{ textAlign: 'center' }}>
          <Link component={RouterLink} to="/signup" variant="body2">
            {"Chưa có tài khoản? Đăng Ký"}
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 
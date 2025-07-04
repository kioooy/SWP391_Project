import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setAccountType } from '../features/auth/authSlice';
import {
  Container, Typography, Box, Card, CardContent, Grid, Avatar, Button, Chip, Divider, Snackbar, Alert
} from '@mui/material';
import {
  LocationOn, Phone, Email, Bloodtype, Badge, Cake, Wc, Height, MonitorWeight
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const StaffProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    fullName: '',
    citizenNumber: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    weight: '',
    height: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const response = await axios.get(`${API_URL}/User/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data[0];
      if (userData) {
        setFormData({
          fullName: userData.fullName || '',
          citizenNumber: userData.citizenNumber || '',
          dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('YYYY-MM-DD') : '',
          gender: userData.sex === true ? 'Nam' : userData.sex === false ? 'Nữ' : '',
          bloodType: userData.bloodTypeName || '',
          phone: userData.phoneNumber || '',
          email: userData.email || '',
          address: userData.address || '',
          weight: userData.weight || '',
          height: userData.height || '',
        });
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi tải thông tin người dùng.', severity: 'error' });
    }
  };

  useEffect(() => { fetchUserProfile(); }, []);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4, background: '#e3f2fd', borderRadius: 4, boxShadow: 3, mt: 6 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
        <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3.5rem', mb: 2, boxShadow: 2 }}>
          {formData.fullName.charAt(0)}
        </Avatar>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="primary.main">
          {formData.fullName}
        </Typography>
        <Chip label="Nhân viên" color="secondary" sx={{ mb: 2, fontWeight: 'bold', fontSize: 16, px: 2, py: 1 }} />
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, textAlign: 'center' }}>
          Hỗ trợ vận hành, kiểm soát dữ liệu và chăm sóc người hiến máu.
        </Typography>
        <Button variant="outlined" color="error" sx={{ mt: 1, fontWeight: 'bold' }} onClick={handleLogout}>
          Đăng xuất
        </Button>
      </Box>
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>Thông tin liên hệ</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.phone || 'Chưa cập nhật'}</Typography>
              <Typography variant="body2" sx={{ mb: 1 }}><Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.email || 'Chưa cập nhật'}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}><LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.address || 'Chưa có địa chỉ'}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 3, boxShadow: 1 }}>
            <CardContent>
              <Typography variant="subtitle2" color="primary" gutterBottom>Thông tin cá nhân</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Badge sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">Số CMND: {formData.citizenNumber || 'Chưa cập nhật'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Cake sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">Ngày sinh: {formData.dateOfBirth || 'Chưa cập nhật'}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Wc sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2">Giới tính: {formData.gender || 'Chưa cập nhật'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default StaffProfile; 
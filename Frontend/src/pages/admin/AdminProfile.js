import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, setAccountType } from '../../features/auth/authSlice';
import {
  Container, Typography, Box, Card, CardContent, Grid, Avatar, Button, Chip, Divider, Snackbar, Alert
} from '@mui/material';
import {
  LocationOn, Phone, Email, Bloodtype, Badge, Cake, Wc, Height, MonitorWeight
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const AdminProfile = () => {
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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Hồ sơ quản trị viên
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar sx={{ width: 120, height: 120, bgcolor: 'primary.main', fontSize: '3rem', mb: 2 }}>
                  {formData.fullName.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>{formData.fullName}</Typography>
                <Chip label="Quản trị viên" color="secondary" sx={{ mb: 1, fontWeight: 'bold' }} />
                <Chip icon={<Bloodtype />} label={`Nhóm máu ${formData.bloodType}`} color="error" sx={{ mb: 1 }} />
                <Button variant="outlined" color="error" sx={{ mt: 1 }} onClick={handleLogout}>
                  Đăng xuất
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Thông tin liên hệ</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}><Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.phone}</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}><Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.email}</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}><LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />{formData.address || 'Chưa có địa chỉ'}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Thông tin cá nhân</Typography>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Height sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2">Chiều cao: {formData.height ? `${formData.height} cm` : 'Chưa cập nhật'}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonitorWeight sx={{ mr: 1.5, color: 'text.secondary', fontSize: 18 }} />
                  <Typography variant="body2">Cân nặng: {formData.weight ? `${formData.weight} kg` : 'Chưa cập nhật'}</Typography>
                </Box>
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

export default AdminProfile; 
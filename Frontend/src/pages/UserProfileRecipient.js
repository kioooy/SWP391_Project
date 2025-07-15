import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, updateUserLocation, logout, setAccountType } from '../features/auth/authSlice';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn,
  Phone,
  Email,
  Bloodtype,
  CalendarToday,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Badge,
  Cake,
  Wc,
  Height,
  MonitorWeight,
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return d;
}

const UserProfileRecipient = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const locationButtonRef = useRef(null);
  const { user, token: authToken } = useSelector((state) => state.auth);
  const userId = user?.userId;

  const [openDialog, setOpenDialog] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    citizenNumber: '',
    citizenIdCard: '',
    dateOfBirth: '',
    gender: '',
    bloodType: '',
    phone: '',
    email: '',
    address: '',
    weight: '',
    height: '',
    latitude: '',
    longitude: '',
    medicalHistory: '',
    allergies: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [completedTransfusionHistory, setCompletedTransfusionHistory] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [editFormData, setEditFormData] = useState({});

  const isDonor = user?.isDonor || user?.member?.isDonor || formData?.isDonor;
  const isRecipient = user?.isRecipient || user?.member?.isRecipient || formData?.isRecipient;

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Không tìm thấy token xác thực.', severity: 'error' });
        return;
      }
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const response = await axios.get(`${API_URL}/User/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data[0];
      if (userData) {
        const id = userData.userId || userData.UserId || user?.userId;
        setFormData({
          id,
          fullName: userData.fullName || '',
          citizenNumber: userData.citizenNumber || '',
          dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('YYYY-MM-DD') : '',
          gender: userData.sex === true ? 'male' : userData.sex === false ? 'female' : '',
          bloodType: userData.bloodTypeName || '',
          phone: userData.phoneNumber || '',
          email: userData.email || '',
          address: userData.address || '',
          weight: userData.weight || userData.Weight || '',
          height: userData.height || userData.Height || '',
          latitude: userData.latitude || '',
          longitude: userData.longitude || '',
          isDonor: userData.isDonor ?? userData.IsDonor ?? false,
          isRecipient: userData.isRecipient ?? userData.IsRecipient ?? false,
        });
        dispatch(setAccountType({
          isDonor: userData.isDonor ?? userData.IsDonor ?? false,
          isRecipient: userData.isRecipient ?? userData.IsRecipient ?? false,
        }));
      }
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || 'Lỗi khi tải thông tin người dùng.', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleUpdateLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError('Trình duyệt của bạn không hỗ trợ định vị địa lý.');
      setLocationLoading(false);
      return;
    }
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });
      const { latitude, longitude } = position.coords;
      setUserLocation({ latitude, longitude });
      let address = '';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        address = data.display_name || '';
      } catch (err) {
        address = '';
      }
      const token = localStorage.getItem('token');
      if (token && user?.userId) {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        await axios.put(`${apiUrl}/User/${user?.userId}/location`, {
          latitude,
          longitude,
          address
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setFormData((prev) => ({ ...prev, address, latitude, longitude }));
      setSnackbar({ open: true, message: 'Cập nhật vị trí thành công!', severity: 'success' });
    } catch (error) {
      let errorMessage = 'Không thể lấy vị trí hiện tại.';
      if (error.code === 1) {
        errorMessage = 'Quyền truy cập vị trí bị từ chối. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.';
      } else if (error.code === 2) {
        errorMessage = 'Không thể xác định vị trí hiện tại. Vui lòng thử lại.';
      } else if (error.code === 3) {
        errorMessage = 'Hết thời gian chờ lấy vị trí. Vui lòng thử lại.';
      }
      setLocationError(errorMessage);
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setLocationLoading(false);
    }
  };

  // Thêm hàm handleOpenDialog giống UserProfile.js
  const handleOpenDialog = async () => {
    await fetchUserProfile(); // Lấy dữ liệu mới nhất từ backend
    setEditFormData(formData); // Đảm bảo form luôn có dữ liệu mới nhất
    setOpenDialog(true);
  };

  // Validate form dùng editFormData
  const validateForm = () => {
    const errors = {};
    // Số điện thoại: 10 số
    if (!editFormData.phone || !/^0[0-9]{9}$/.test(editFormData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ.';
    }
    // Email: định dạng cơ bản
    if (!editFormData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editFormData.email)) {
      errors.email = 'Email không hợp lệ.';
    }
    // Địa chỉ: tối thiểu 5 ký tự
    if (!editFormData.address || editFormData.address.length < 5) {
      errors.address = 'Vui lòng nhập địa chỉ.';
    }
    // Cân nặng: số, 30-300
    const weightNum = Number(editFormData.weight);
    if (isNaN(weightNum) || weightNum < 30 || weightNum > 300) {
      errors.weight = 'Cân nặng phải từ 30 đến 300 kg.';
    }
    // Chiều cao: số, 100-300
    const heightNum = Number(editFormData.height);
    if (isNaN(heightNum) || heightNum < 100 || heightNum > 300) {
      errors.height = 'Chiều cao phải từ 100 đến 300 cm.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Hàm handleSubmit cập nhật thông tin cá nhân
  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Không tìm thấy token xác thực.', severity: 'error' });
        return;
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const payload = {
        PhoneNumber: editFormData.phone,
        Email: editFormData.email,
        Address: editFormData.address,
        Weight: Number(editFormData.weight),
        Height: Number(editFormData.height),
      };
      await axios.patch(`${apiUrl}/User/${formData.id}/profile`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
      setOpenDialog(false);
      fetchUserProfile();
    } catch (error) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật thông tin.', severity: 'error' });
    }
  };

  // Hàm đóng Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Hồ sơ người truyền máu
      </Typography>
      <Grid container spacing={4}>
        {/* Thông tin cơ bản */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                    mb: 2,
                  }}
                >
                  {formData.fullName.charAt(0)}
                </Avatar>
                <Typography variant="h5" gutterBottom>
                  {formData.fullName}
                </Typography>
                {isRecipient && (
                  <Chip label="Tài khoản truyền máu" color="info" sx={{ mb: 1, fontWeight: 'bold' }} />
                )}
                <Chip
                  icon={<Bloodtype sx={{ fontSize: 20 }} />}
                  label={`Nhóm máu ${formData.bloodType}`}
                  color="error"
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={handleOpenDialog}
                >
                  Chỉnh sửa thông tin
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={async () => { await dispatch(logout()); navigate('/home'); }}
                >
                  Đăng xuất
                </Button>
              </Box>
              <Divider sx={{ my: 2 }} />

              {/* Thông tin liên hệ */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Phone sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  {formData.phone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Email sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} />
                  {formData.email}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  <LocationOn sx={{ fontSize: 20, verticalAlign: 'middle', mr: 1 }} /> {formData.address || 'Chưa có địa chỉ'}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Cập nhật vị trí của bạn để giúp những người cần máu có thể tìm thấy bạn dễ dàng hơn.
                  </Typography>
                  <Button
                    ref={locationButtonRef}
                    variant="contained"
                    color="primary"
                    onClick={handleUpdateLocation}
                    disabled={locationLoading}
                    startIcon={<LocationOn />}
                  >
                    {locationLoading ? 'Đang cập nhật...' : 'Cập nhật vị trí hiện tại'}
                  </Button>
                  {locationError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      {locationError}
                    </Alert>
                  )}
                </Box>
              </Box>

              {/* Thông tin cá nhân */}
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin cá nhân
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Badge sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Số CMND:</strong> {formData.citizenNumber || 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Cake sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Ngày sinh:</strong> {formData.dateOfBirth || 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Wc sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Giới tính:</strong> {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Height sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Chiều cao:</strong> {formData.height ? `${formData.height} cm` : 'Chưa cập nhật'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MonitorWeight sx={{ mr: 1.5, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body1">
                    <strong>Cân nặng:</strong> {formData.weight ? `${formData.weight} kg` : 'Chưa cập nhật'}
                  </Typography>
                </Box>
                {formData.medicalHistory && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Tiền sử bệnh án: {formData.medicalHistory}
                  </Typography>
                )}
                {formData.allergies && (
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    Dị ứng: {formData.allergies}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Lịch hẹn sắp tới */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent sx={{ minHeight: 200 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={0} aria-label="upcoming appointments tab" sx={{ mb: 2 }}>
                  <Tab label="Lịch hẹn sắp tới" />
                </Tabs>
              </Box>
              {/* Nội dung tab lịch hẹn sắp tới */}
              {upcomingAppointments.length === 0 ? (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', mt: 6 }}>
                  <Typography variant="body1" color="text.secondary" align="center">
                    Hiện chưa có lịch hẹn.
                  </Typography>
                </Box>
              ) : (
                <></>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Dialog chỉnh sửa thông tin */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="phone"
            label="Số điện thoại"
            type="tel"
            fullWidth
            variant="outlined"
            value={editFormData.phone || ''}
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value.replace(/[^0-9]/g, '').slice(0,10) })}
            sx={{ mb: 2 }}
            error={!!formErrors.phone}
            helperText={formErrors.phone}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={editFormData.email || ''}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '') })}
            sx={{ mb: 2 }}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
          <TextField
            margin="dense"
            name="address"
            label="Địa chỉ"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.address || ''}
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value.replace(/[^ -\p{L}0-9\s,./-]/gu, '') })}
            sx={{ mb: 2 }}
            error={!!formErrors.address}
            helperText={formErrors.address}
          />
          <TextField
            margin="dense"
            name="weight"
            label="Cân nặng (kg)"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.weight || ''}
            onChange={(e) => setEditFormData({ ...editFormData, weight: e.target.value.replace(/[^0-9]/g, '').slice(0,3) })}
            sx={{ mb: 2 }}
            error={!!formErrors.weight}
            helperText={formErrors.weight}
          />
          <TextField
            margin="dense"
            name="height"
            label="Chiều cao (cm)"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.height || ''}
            onChange={(e) => setEditFormData({ ...editFormData, height: e.target.value.replace(/[^0-9]/g, '').slice(0,3) })}
            sx={{ mb: 2 }}
            error={!!formErrors.height}
            helperText={formErrors.height}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
      {/* ... giữ nguyên các dialog, snackbar ... */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfileRecipient; 
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

  useEffect(() => {
    const fetchCompletedTransfusionHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        // Lấy lịch sử truyền máu đã hoàn thành
        const res = await axios.get(`${apiUrl}/TransfusionHistory`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedTransfusionHistory(res.data || []);
      } catch (error) {
        setCompletedTransfusionHistory([]);
      }
    };
    fetchCompletedTransfusionHistory();
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            {children}
          </Box>
        )}
      </div>
    );
  }

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
                  icon={<Bloodtype />}
                  label={`Nhóm máu ${formData.bloodType}`}
                  color="error"
                  sx={{ mb: 1 }}
                />
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  onClick={() => setOpenDialog(true)}
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
                  <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                  {formData.phone}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                  {formData.email}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} /> {formData.address || 'Chưa có địa chỉ'}
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
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Số CMND: {formData.citizenNumber}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <CalendarToday sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                  Ngày sinh: {formData.dateOfBirth}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Giới tính: {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : 'Không xác định'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Chiều cao: {formData.height} cm
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Cân nặng: {formData.weight} kg
                </Typography>
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
        {/* Lịch sử truyền máu và lịch hẹn sắp tới */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="transfusion history tabs">
                  <Tab label="Lịch sử truyền máu" />
                  <Tab label="Lịch hẹn sắp tới" />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>Lịch sử truyền máu đã hoàn thành</Typography>
                {completedTransfusionHistory.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Địa điểm</TableCell>
                          <TableCell>Nhóm máu</TableCell>
                          <TableCell>Thể tích (ml)</TableCell>
                          <TableCell>Trạng thái</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {completedTransfusionHistory.map((row, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{row.date}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{row.bloodType}</TableCell>
                            <TableCell>{row.volume}</TableCell>
                            <TableCell>{row.status}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Chưa có lịch sử truyền máu đã hoàn thành.
                  </Typography>
                )}
              </TabPanel>
              {/* Tab lịch hẹn sắp tới giữ nguyên hoặc tuỳ chỉnh nếu cần */}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* ... giữ nguyên các dialog, snackbar ... */}
    </Container>
  );
};

export default UserProfileRecipient; 
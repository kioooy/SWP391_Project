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

// Hàm tính khoảng cách Haversine giữa hai điểm (latitude, longitude)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

const UserProfile = () => {
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
    latitude: '', // Thêm trường latitude vào trạng thái ban đầu
    longitude: '', // Thêm trường longitude vào trạng thái ban đầu
    medicalHistory: '',
    allergies: '',
  });

  // State cho Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // State cho lịch hẹn sắp tới
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);

  // State cho lịch sử hiến máu (chỉ những lịch đã hoàn thành)
  const [completedDonationHistory, setCompletedDonationHistory] = useState([]);

  // State cho lỗi form
  const [formErrors, setFormErrors] = useState({});

  // State cho dữ liệu chỉnh sửa trong dialog
  const [editFormData, setEditFormData] = useState({});

  // Lấy loại tài khoản từ nhiều nguồn
  const isDonor = user?.isDonor || user?.member?.isDonor || formData?.isDonor;
  const isRecipient = user?.isRecipient || user?.member?.isRecipient || formData?.isRecipient;
  console.log('DEBUG loại tài khoản:', { isDonor, isRecipient, user, formData });

  // Định nghĩa fetchUserProfile bên ngoài useEffect để có thể gọi lại
  const fetchUserProfile = async () => {
    try {
      console.log('fetchUserProfile được gọi lại');
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Không tìm thấy token xác thực.', severity: 'error' });
        return;
      }
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const response = await axios.get(`${API_URL}/User/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Dữ liệu user mới:', response.data);
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
        // Đồng bộ loại tài khoản vào Redux
        dispatch(setAccountType({
          isDonor: userData.isDonor ?? userData.IsDonor ?? false,
          isRecipient: userData.isRecipient ?? userData.IsRecipient ?? false,
        }));
      } else {
        console.warn('Không lấy được userData từ API');
      }
    } catch (error) {
      console.error('Lỗi khi lấy thông tin người dùng:', error);
      setSnackbar({ open: true, message: error.response?.data?.message || 'Lỗi khi tải thông tin người dùng.', severity: 'error' });
    }
  };

  // useEffect chỉ gọi fetchUserProfile khi mount
  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Thêm hàm reloadUpcomingAppointments để có thể gọi lại khi cần
  const reloadUpcomingAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const res = await axios.get(`${apiUrl}/DonationRequest/upcoming/all-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpcomingAppointments(res.data || []);
    } catch (error) {
      setUpcomingAppointments([]);
    }
  };

  // Sửa useEffect cũ thành gọi reloadUpcomingAppointments
  useEffect(() => {
    reloadUpcomingAppointments();
  }, []);

  // useEffect lấy lịch sử hiến máu đã hoàn thành từ backend
  useEffect(() => {
    const fetchCompletedDonationHistory = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        // Lấy lịch sử hiến máu đã hoàn thành từ endpoint mới
        const res = await axios.get(`${apiUrl}/DonationRequest/history/completed`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompletedDonationHistory(res.data || []);
      } catch (error) {
        setCompletedDonationHistory([]);
      }
    };
    fetchCompletedDonationHistory();
  }, []);

  // Hàm đóng Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Hàm xử lý đăng xuất
  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.removeItem("isTestUser");
    localStorage.removeItem("isStaff");
    navigate("/home");
  };

  // Hàm mở dialog xác nhận hủy lịch hẹn
  const handleOpenCancelDialog = (appointment) => {
    setAppointmentToCancel(appointment);
    setOpenCancelDialog(true);
  };

  // Hàm xác nhận hủy lịch hẹn
  const handleConfirmCancel = async () => {
    if (!appointmentToCancel) return;
    console.log('Appointment to cancel:', appointmentToCancel); // Log để debug
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      await axios.patch(`${apiUrl}/DonationRequest/${appointmentToCancel.donationId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Lịch hẹn đã được hủy thành công!', severity: 'success' });
      setOpenCancelDialog(false);
      setAppointmentToCancel(null);
      // Reload lại danh sách lịch hẹn
      reloadUpcomingAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      let errorMessage = 'Lỗi khi hủy lịch hẹn.';
      if (error.response?.data) {
        errorMessage = error.response.data;
      }
      setSnackbar({ open: true, message: errorMessage, severity: 'error' });
    }
  };

  // Hàm hủy dialog xác nhận
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setAppointmentToCancel(null);
  };

  const handleOpenDialog = () => {
    setEditFormData(formData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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

      // Gọi API reverse geocoding để lấy địa chỉ từ toạ độ
      let address = '';
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        address = data.display_name || '';
      } catch (err) {
        address = '';
      }

      // Gửi vị trí và địa chỉ lên server
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

      // Cập nhật địa chỉ vào formData
      setFormData((prev) => ({ ...prev, address, latitude, longitude }));

      setSnackbar({ 
        open: true, 
        message: 'Cập nhật vị trí thành công!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Lỗi khi cập nhật vị trí:', error);
      let errorMessage = 'Không thể lấy vị trí hiện tại.';
      if (error.code === 1) {
        errorMessage = 'Quyền truy cập vị trí bị từ chối. Vui lòng cho phép truy cập vị trí trong cài đặt trình duyệt.';
      } else if (error.code === 2) {
        errorMessage = 'Không thể xác định vị trí hiện tại. Vui lòng thử lại.';
      } else if (error.code === 3) {
        errorMessage = 'Hết thời gian chờ lấy vị trí. Vui lòng thử lại.';
      }
      setLocationError(errorMessage);
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Validate form dùng editFormData
  const validateForm = () => {
    const errors = {};
    // Họ tên: chỉ chữ và khoảng trắng, tối thiểu 2 ký tự
    const fullNameTrim = (editFormData.fullName || '').trim();
    if (!fullNameTrim || !/^[\p{L}\s]+$/u.test(fullNameTrim) || fullNameTrim.length < 2) {
      errors.fullName = 'Họ và tên chỉ được nhập chữ và tối thiểu 2 ký tự.';
    }
    // Số CCCD: đúng 12 số
    if (!editFormData.citizenNumber || !/^\d{12}$/.test(editFormData.citizenNumber)) {
      errors.citizenNumber = 'Số CCCD phải là 12 chữ số.';
    }
    // Giới tính: chỉ Nam/Nữ
    if (editFormData.gender !== 'male' && editFormData.gender !== 'female') {
      errors.gender = 'Giới tính chỉ được chọn Nam hoặc Nữ.';
    }
    // Cân nặng: số, 45-300
    const weightNum = Number(editFormData.weight);
    if (isNaN(weightNum) || weightNum < 45 || weightNum > 300) {
      errors.weight = 'Cân nặng phải từ 45 đến 300 kg.';
    }
    // Chiều cao: số, 145-300
    const heightNum = Number(editFormData.height);
    if (isNaN(heightNum) || heightNum < 145 || heightNum > 300) {
      errors.height = 'Chiều cao phải từ 145 đến 300 cm.';
    }
    // Số điện thoại: 10 số, bắt đầu 03,05,07,08,09
    if (!editFormData.phone || !/^0[3|5|7|8|9][0-9]{8}$/.test(editFormData.phone)) {
      errors.phone = 'Số điện thoại không hợp lệ.';
    }
    // Địa chỉ
    if (!editFormData.address || editFormData.address.length < 5) {
      errors.address = 'Vui lòng nhập địa chỉ.';
    }
    // Ngày sinh
    if (!editFormData.dateOfBirth) {
      errors.dateOfBirth = 'Vui lòng nhập ngày sinh.';
    }
    // Email: không ký tự đặc biệt ngoài @ và .
    if (!editFormData.email || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(editFormData.email)) {
      errors.email = 'Email không hợp lệ hoặc chứa ký tự đặc biệt.';
    }
    // Địa chỉ: không ký tự đặc biệt ngoài chữ, số, khoảng trắng, dấu phẩy, chấm, gạch ngang
    if (!editFormData.address || /[^a-zA-Z0-9\s,.-]/.test(editFormData.address)) {
      errors.address = 'Địa chỉ không được chứa ký tự đặc biệt.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Không tìm thấy token xác thực.', severity: 'error' });
        return;
      }
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      // Chỉ gửi các trường backend chấp nhận, đúng tên trường model backend
      const payload = {
        FullName: editFormData.fullName.trim(),
        PhoneNumber: editFormData.phone,
        Address: editFormData.address,
        Sex: editFormData.gender === 'male' ? true : editFormData.gender === 'female' ? false : null,
        Weight: Number(editFormData.weight),
        Height: Number(editFormData.height),
        // Thêm Latitude và Longitude vào payload nếu có giá trị hợp lệ
        ...(editFormData.latitude && !isNaN(Number(editFormData.latitude)) && { Latitude: Number(editFormData.latitude) }),
        ...(editFormData.longitude && !isNaN(Number(editFormData.longitude)) && { Longitude: Number(editFormData.longitude) }),
      };
      console.log('Payload gửi lên:', payload);
      const response = await axios.patch(`${apiUrl}/User/${editFormData.id}/profile`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Response cập nhật:', response);
      if (response.status === 200 || response.status === 204) {
        setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
        handleCloseDialog();
        // Fetch lại dữ liệu mới nhất từ API
        fetchUserProfile();
      } else {
        setSnackbar({ open: true, message: `Lỗi khi cập nhật: ${response.statusText}`, severity: 'error' });
      }
    } catch (error) {
      console.error('Lỗi cập nhật thông tin:', error);
      setSnackbar({ open: true, message: `Lỗi cập nhật thông tin: ${error.message}`, severity: 'error' });
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Hoàn thành"
            color="success"
            size="small"
          />
        );
      case 'scheduled':
      case 'Approved':
        return (
          <Chip
            icon={<CalendarToday />}
            label="Đã lên lịch"
            color="primary"
            size="small"
          />
        );
      case 'cancelled':
      case 'Cancelled':
      case 'Rejected':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Đã hủy"
            color="error"
            size="small"
          />
        );
      case 'Pending':
        return (
          <Chip
            label="Chờ duyệt"
            color="warning"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Component TabPanel để hiển thị nội dung tab
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
        Hồ sơ người dùng
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
                {/* Hiển thị loại tài khoản */}
                {isDonor && (
                  <Chip label="Tài khoản hiến máu" color="success" sx={{ mb: 1, fontWeight: 'bold' }} />
                )}
                {isRecipient && !isDonor && (
                  <Chip label="Tài khoản truyền máu" color="info" sx={{ mb: 1, fontWeight: 'bold' }} />
                )}
                {!isDonor && !isRecipient && (
                  <Chip label="Không xác định loại tài khoản" color="warning" sx={{ mb: 1, fontWeight: 'bold' }} />
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
                  onClick={handleOpenDialog}
                >
                  Chỉnh sửa thông tin
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  sx={{ mt: 1 }}
                  onClick={handleLogout}
                >
                  Đăng xuất
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

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


                {user?.role && user.role.toString().toLowerCase() === 'member' && (

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
                )}
              </Box>

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

        {/* Lịch sử hiến máu và lịch hẹn sắp tới */} 
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="donation history tabs">
                  <Tab label="Lịch sử hiến máu" />
                  <Tab label="Lịch hẹn sắp tới" />
                </Tabs>
              </Box>
              <TabPanel value={tabValue} index={0}>
                <Typography variant="h6" gutterBottom>Lịch sử hiến máu đã hoàn thành</Typography>
                {completedDonationHistory.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ngày</TableCell>
                          <TableCell>Địa điểm</TableCell>
                          <TableCell>Nhóm máu</TableCell>
                          <TableCell>Thể tích (ml)</TableCell>
                          <TableCell>Trạng thái</TableCell>
                          <TableCell>Ngày hiến máu tiếp theo</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {completedDonationHistory.map((row) => (
                          <TableRow key={row.donationId}>
                            <TableCell>{row.preferredDonationDate ? dayjs(row.preferredDonationDate).format('DD/MM/YYYY') : ''}</TableCell>
                            <TableCell>{row.location}</TableCell>
                            <TableCell>{formData.bloodType}</TableCell>
                            <TableCell>{row.donationVolume}</TableCell>
                            <TableCell>{getStatusChip(row.status)}</TableCell>
                            <TableCell></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Chưa có lịch sử hiến máu đã hoàn thành.
                  </Typography>
                )}
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Lịch hẹn sắp tới</Typography>
                {upcomingAppointments.length > 0 ? (
                  upcomingAppointments.map((appointment, index) => {
                    // Cố gắng parse "notes" để lấy giờ và địa điểm bệnh viện
                    let hospitalName = '';
                    let timeSlot = 'Không xác định';
                    if (appointment.notes) {
                        const hospitalMatch = appointment.notes.match(/Địa điểm hiến máu: (.*?)\./);
                        const timeMatch = appointment.notes.match(/Khung giờ: (.*)/);
                        if (hospitalMatch && hospitalMatch[1] !== 'Chưa chọn') {
                            hospitalName = hospitalMatch[1];
                        }
                        if (timeMatch) {
                            timeSlot = timeMatch[1];
                        }
                    }

                    return (
                      <Box key={index} sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
                        <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ mb: 2 }}>
                          Thông tin đăng ký hiến máu
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Mã đăng ký</Typography>
                            <Typography variant="body1" fontWeight="bold">#{appointment.donationId}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                            {getStatusChip(appointment.status)}
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Ngày dự kiến hiến</Typography>
                            <Typography variant="body1" fontWeight="bold">{dayjs(appointment.preferredDonationDate).format('DD/MM/YYYY')}</Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">Đợt hiến máu</Typography>
                            <Typography variant="body1" fontWeight="bold">{appointment.periodName}</Typography>
                          </Grid>
                          <Grid item xs={12}>
                              <Typography variant="body2" color="text.secondary">Địa điểm</Typography>
                              <Typography variant="body1" fontWeight="bold">{hospitalName || 'Chưa có thông tin bệnh viện'}</Typography>
                              <Typography variant="body2" color="text.secondary">{appointment.location}</Typography>
                          </Grid>
                        </Grid>
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleOpenCancelDialog(appointment)}
                            >
                              Hủy lịch hẹn
                            </Button>
                        </Box>
                      </Box>
                    );
                  })
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      Chưa có lịch hẹn nào.
                    </Typography>
                    <Button 
                      variant="contained" 
                      sx={{ mt: 2 }}
                      onClick={() => window.location.href = '/booking'}
                    >
                      Đặt lịch ngay
                    </Button>
                  </Box>
                )}
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog chỉnh sửa thông tin */} 
      <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="fullName"
            label="Họ và tên"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.fullName || ''}
            disabled
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="citizenNumber"
            label="Số CCCD"
            type="text"
            fullWidth
            variant="outlined"
            value={editFormData.citizenNumber || ''}
            disabled
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="dateOfBirth"
            label="Ngày sinh"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            value={editFormData.dateOfBirth || ''}
            disabled
            InputProps={{ readOnly: true }}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Giới tính</InputLabel>
            <Select
              name="gender"
              value={editFormData.gender || ''}
              disabled
              inputProps={{ readOnly: true }}
              label="Giới tính"
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
            </Select>
          </FormControl>
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
            onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value.replace(/[^a-zA-Z0-9\s,.-]/g, '') })}
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
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận hủy lịch hẹn */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
          Xác nhận hủy lịch hẹn
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn hủy lịch hẹn này không?
          </Typography>
          {appointmentToCancel && (
            <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary.main">
                Thông tin lịch hẹn:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Ngày hẹn:</strong> {appointmentToCancel.detail?.appointmentDate}
              </Typography>
              <Typography variant="body2">
                <strong>Địa điểm:</strong> {appointmentToCancel.detail?.donationCenter}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontStyle: 'italic' }}>
            ⚠️ Hành động này không thể hoàn tác. Lịch hẹn sẽ bị hủy vĩnh viễn.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} variant="outlined">
            Không hủy
          </Button>
          <Button onClick={handleConfirmCancel} variant="contained" color="error">
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UserProfile;
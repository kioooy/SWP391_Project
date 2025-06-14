import React, { useState, useEffect } from 'react';
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
} from '@mui/icons-material';
import axios from 'axios';
import dayjs from 'dayjs';

const UserProfile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
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
    medicalHistory: '',
    allergies: '',
  });

  // State cho Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch dữ liệu người dùng từ API khi component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
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

        const userData = response.data[0]; 
        if (userData) {
          setFormData({
            ...userData,
            fullName: userData.fullName || '',
            citizenNumber: userData.citizenNumber || '',
            citizenIdCard: userData.citizenIdCard || '',
            dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('YYYY-MM-DD') : '',
            gender: userData.sex === true ? 'male' : userData.sex === false ? 'female' : '',
            bloodType: userData.bloodTypeName || '',
            phone: userData.phoneNumber || '',
            email: userData.email || '',
            address: userData.address || '',
            weight: userData.weight || '',
            height: userData.height || '',
            // medicalHistory và allergies không có trong API GetUserProfile, giữ nguyên mặc định hoặc lấy từ nguồn khác nếu có
            medicalHistory: '', 
            allergies: '',
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Lỗi khi tải thông tin người dùng.', severity: 'error' });
      }
    };

    fetchUserProfile();
  }, []);

  // Hàm đóng Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Dữ liệu mẫu lịch sử hiến máu
  const donationHistory = [
    {
      id: 1,
      date: '2024-03-15',
      location: 'Bệnh viện Chợ Rẫy',
      bloodType: 'A+',
      volume: 350,
      status: 'completed',
      nextDonationDate: '2024-06-15',
    },
    {
      id: 2,
      date: '2023-12-10',
      location: 'Bệnh viện Nhi Đồng 1',
      bloodType: 'A+',
      volume: 350,
      status: 'completed',
      nextDonationDate: '2024-03-10',
    },
    {
      id: 3,
      date: '2023-09-05',
      location: 'Bệnh viện 115',
      bloodType: 'A+',
      volume: 250,
      status: 'completed',
      nextDonationDate: '2023-12-05',
    },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Không tìm thấy token xác thực.', severity: 'error' });
        return;
      }

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const payload = {
        ...formData,
        sex: formData.gender === 'male' ? true : formData.gender === 'female' ? false : null,
        bloodTypeName: formData.bloodType,
        phoneNumber: formData.phone,
        citizenNumber: formData.citizenNumber,
        citizenIdCard: formData.citizenIdCard,
      };

      // Xóa các trường không cần thiết hoặc đã được ánh xạ lại
      delete payload.gender;
      delete payload.bloodType;
      delete payload.phone;

      const response = await axios.put(`${apiUrl}/users/${formData.id}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setSnackbar({ open: true, message: 'Cập nhật thông tin thành công!', severity: 'success' });
        handleCloseDialog();
        // Có thể cần cập nhật lại dữ liệu người dùng sau khi lưu thành công
        // Ví dụ: fetchData();
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
        return (
          <Chip
            icon={<CalendarToday />}
            label="Đã lên lịch"
            color="primary"
            size="small"
          />
        );
      case 'cancelled':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Đã hủy"
            color="error"
            size="small"
          />
        );
      default:
        return null;
    }
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
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                  {formData.address}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin cá nhân
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
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Số CMND: {formData.citizenNumber}
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

        {/* Lịch sử hiến máu và lịch hẹn */} 
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
                <Typography variant="h6" gutterBottom>Lịch sử hiến máu</Typography>
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
                      {donationHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>{row.bloodType}</TableCell>
                          <TableCell>{row.volume}</TableCell>
                          <TableCell>{getStatusChip(row.status)}</TableCell>
                          <TableCell>{row.nextDonationDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" gutterBottom>Lịch hẹn sắp tới</Typography>
                <Typography variant="body1">Chưa có lịch hẹn nào.</Typography>
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
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="citizenNumber"
            label="Số CMND"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.citizenNumber}
            onChange={(e) => setFormData({ ...formData, citizenNumber: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            margin="dense"
            name="dateOfBirth"
            label="Ngày sinh"
            type="date"
            fullWidth
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth variant="outlined" sx={{ mb: 2 }}>
            <InputLabel>Giới tính</InputLabel>
            <Select
              name="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              label="Giới tính"
            >
              <MenuItem value="male">Nam</MenuItem>
              <MenuItem value="female">Nữ</MenuItem>
              <MenuItem value="other">Khác</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            name="phone"
            label="Số điện thoại"
            type="tel"
            fullWidth
            variant="outlined"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="email"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="address"
            label="Địa chỉ"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="weight"
            label="Cân nặng (kg)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="height"
            label="Chiều cao (cm)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="medicalHistory"
            label="Tiền sử bệnh án"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.medicalHistory}
            onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="allergies"
            label="Dị ứng"
            type="text"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            Lưu thay đổi
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserProfile; 
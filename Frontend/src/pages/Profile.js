import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Divider,
  Button,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from '@mui/material';
import { logout } from '../features/auth/authSlice';
import NewspaperIcon from '@mui/icons-material/Newspaper';
import EditIcon from '@mui/icons-material/Edit';
import dayjs from 'dayjs'; // Import dayjs for date formatting

// Add occupations list, typically this would be imported or fetched
const occupations = [
  'Học sinh/Sinh viên',
  'Giáo viên',
  'Bác sĩ',
  'Y tá/Điều dưỡng',
  'Kỹ sư',
  'Công nhân',
  'Nông dân',
  'Kinh doanh',
  'Công chức/Viên chức',
  'Lao động tự do',
  'Nghỉ hưu',
  'Khác',
];

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isTestUser = localStorage.getItem('isTestUser') === 'true';

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    fullName: '',
    citizenNumber: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    sex: '',
    address: '',
    bloodTypeName: '',
    weight: '',
    height: '',
    isDonor: false,
    isRecipient: false,
  });
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

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

        // API trả về một mảng, nên lấy phần tử đầu tiên
        const userData = response.data[0]; 
        if (userData) {
          setEditedUser({
            ...userData,
            dateOfBirth: userData.dateOfBirth ? dayjs(userData.dateOfBirth).format('YYYY-MM-DD') : '',
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin người dùng:', error);
        setSnackbar({ open: true, message: error.response?.data?.message || 'Lỗi khi tải thông tin người dùng.', severity: 'error' });
      }
    };

    fetchUserProfile();
  }, []);

  // Load user profile from localStorage when component mounts
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setEditedUser(parsedProfile);
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    }
  }, []);

  // Update editedUser when user changes
  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};
    if (!editedUser.firstName?.trim()) {
      newErrors.firstName = 'Vui lòng nhập họ';
    }
    if (!editedUser.lastName?.trim()) {
      newErrors.lastName = 'Vui lòng nhập tên';
    }
    if (!editedUser.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(editedUser.phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    if (!editedUser.citizenId?.trim()) {
      newErrors.citizenId = 'Vui lòng nhập số CCCD';
    } else if (!/^[0-9]{12}$/.test(editedUser.citizenId)) {
      newErrors.citizenId = 'Số CCCD không hợp lệ';
    }
    if (!editedUser.address?.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!validateForm()) {
      setSnackbar({
        open: true,
        message: 'Vui lòng kiểm tra lại thông tin',
        severity: 'error'
      });
      return;
    }

    try {
      // Lưu thông tin vào localStorage
      localStorage.setItem('userProfile', JSON.stringify(editedUser));

      setSnackbar({
        open: true,
        message: 'Cập nhật thông tin thành công',
        severity: 'success'
      });
      setIsEditing(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi lưu thông tin',
        severity: 'error'
      });
    }
  };

  const handleCancel = () => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setEditedUser(JSON.parse(savedProfile));
    } else if (user) { // Revert to redux user if no saved profile
      setEditedUser({ ...user });
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      // Xóa tất cả thông tin người dùng khỏi localStorage
      localStorage.removeItem('userProfile');
      localStorage.removeItem('token');
      localStorage.removeItem('isTestUser');

      // Dispatch action logout
      await dispatch(logout());

      // Chuyển hướng về trang chủ
      navigate('/');
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Có lỗi xảy ra khi đăng xuất',
        severity: 'error'
      });
    }
  };

  const handleNavigateToNews = () => {
    navigate('/news');
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Sử dụng thông tin từ editedUser thay vì user
  const displayUser = isTestUser ? editedUser : user;

  return (
    <Box sx={{ pt: 10, pb: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Thông tin cá nhân
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  Thông tin cá nhân
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: '#e53935',
                      fontSize: '2rem',
                      mr: 2,
                    }}
                  >
                    {editedUser?.fullName?.charAt(0).toUpperCase() || editedUser?.email?.charAt(0).toUpperCase() || ''}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" gutterBottom>{editedUser?.fullName}</Typography>
                    <Typography variant="body2" color="text.secondary">{editedUser?.email}</Typography>
                  </Box>
                </Box>

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Số CMND</Typography>
                    <Typography variant="body1">{editedUser?.citizenNumber || '-'}</Typography>
                  </Box>

                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Ngày sinh</Typography>
                    <Typography variant="body1">{editedUser?.dateOfBirth ? dayjs(editedUser.dateOfBirth).format('DD/MM/YYYY') : '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Giới tính</Typography>
                    <Typography variant="body1">{editedUser?.sex || '-'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">Nhóm máu</Typography>
                    <Typography variant="body1">{editedUser?.bloodTypeName || '-'}</Typography>
                  </Box>
                </Stack>

              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                    Thông tin liên hệ
                  </Typography>
                  {!isEditing && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleEdit}
                      startIcon={<EditIcon />}
                    >
                      Chỉnh sửa
                    </Button>
                  )}
                </Box>
                <Divider sx={{ mb: 2 }} />

                {isEditing ? (
                  <Stack spacing={2}>
                    <TextField
                      label="Địa chỉ liên hệ"
                      name="address"
                      value={editedUser.address || ''}
                      onChange={handleInputChange}
                      fullWidth
                      multiline
                      rows={3}
                      size="small"
                    />
                    <TextField
                      label="Điện thoại di động"
                      name="phoneNumber"
                      value={editedUser.phoneNumber || ''}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Điện thoại bàn"
                      name="landlinePhone"
                      value={editedUser.landlinePhone || ''}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Cân năng"
                      name="weight"
                      value={editedUser.weight || ''}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                    />
                    <TextField
                      label="Chiều cao"
                      name="height"
                      value={editedUser.height || ''}
                      onChange={handleInputChange}
                      fullWidth
                      size="small"
                    />
                    <FormControl fullWidth size="small">
                      <InputLabel>Nghề nghiệp</InputLabel>
                      <Select
                        name="occupation"
                        value={editedUser.occupation || ''}
                        label="Nghề nghiệp"
                        onChange={handleInputChange}
                      >
                        {occupations.map((occupation) => (
                          <MenuItem key={occupation} value={occupation}>{occupation}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Địa chỉ liên hệ</Typography>
                      <Typography variant="body1">{editedUser?.address || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Điện thoại di động</Typography>
                      <Typography variant="body1">{editedUser?.phoneNumber || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Điện thoại bàn</Typography>
                      <Typography variant="body1">{editedUser?.landlinePhone || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                      <Typography variant="body1">{editedUser?.email || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Cân nặng</Typography>
                      <Typography variant="body1">{editedUser?.weight || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Chiều cao</Typography>
                      <Typography variant="body1">{editedUser?.height || '-'}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">Nghề nghiệp</Typography>
                      <Typography variant="body1">{editedUser?.occupation || '-'}</Typography>
                    </Box>
                  </Stack>
                )}
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            {isEditing ? (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  Lưu
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleCancel}
                  sx={{
                    px: 4,
                    py: 1,
                  }}
                >
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  sx={{
                    px: 4,
                    py: 1,
                    borderColor: '#e53935',
                    color: '#e53935',
                    '&:hover': {
                      borderColor: '#e53935',
                      bgcolor: 'rgba(229,57,53,0.04)'
                    }
                  }}
                >
                  Đăng xuất
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </Container>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile; 
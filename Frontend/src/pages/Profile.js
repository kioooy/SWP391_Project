import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { logout } from '../features/auth/authSlice';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({});

  useEffect(() => {
    if (user) {
      setEditedUser({ ...user });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser({ ...editedUser, [name]: value });
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // TODO: Dispatch Redux action or call API to save changes
    console.log('Saving changes:', editedUser);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedUser({ ...user }); // Revert changes
    setIsEditing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/Home');
  };

  return (
    <Box sx={{ pt: 10, pb: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 600 }}>
          Thông tin cá nhân
        </Typography>
        <Paper sx={{ p: 4, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#e53935',
                fontSize: '2.5rem',
                mr: 3,
              }}
            >
              {user?.firstName?.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              {isEditing ? (
                <Stack spacing={1}>
                  <TextField
                    label="Họ"
                    name="firstName"
                    value={editedUser.firstName || ''}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Tên"
                    name="lastName"
                    value={editedUser.lastName || ''}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    label="Email"
                    name="email"
                    value={editedUser.email || ''}
                    onChange={handleInputChange}
                    fullWidth
                    size="small"
                    disabled
                  />
                </Stack>
              ) : (
                <>
                  <Typography variant="h4" gutterBottom>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {user?.email}
                  </Typography>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <TextField
                  label="Số điện thoại"
                  name="phoneNumber"
                  value={editedUser.phoneNumber || ''}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                />
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Số điện thoại
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.phoneNumber}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <TextField
                  label="Số CCCD"
                  name="citizenId"
                  value={editedUser.citizenId || ''}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                />
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Số CCCD
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.citizenId}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <TextField
                  label="Nhóm máu"
                  name="bloodType"
                  value={editedUser.bloodType || ''}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                />
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Nhóm máu
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.bloodType}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              {isEditing ? (
                <FormControl fullWidth size="small">
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    name="gender"
                    value={editedUser.gender || ''}
                    label="Giới tính"
                    onChange={handleInputChange}
                  >
                    <MenuItem value="Nam">Nam</MenuItem>
                    <MenuItem value="Nữ">Nữ</MenuItem>
                    <MenuItem value="Khác">Khác</MenuItem>
                  </Select>
                </FormControl>
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Giới tính
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {user?.gender}
                  </Typography>
                </>
              )}
            </Grid>

            <Grid item xs={12}>
              {isEditing ? (
                <TextField
                  label="Địa chỉ"
                  name="address"
                  value={editedUser.address || ''}
                  onChange={handleInputChange}
                  fullWidth
                  multiline
                  rows={3}
                />
              ) : (
                <>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Địa chỉ
                  </Typography>
                  <Typography variant="body1">
                    {user?.address}
                  </Typography>
                </>
              )}
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                sx={{
                  px: 4,
                  py: 1,
                }}
              >
                Chỉnh sửa thông tin
              </Button>
            )}

            {!isEditing && (
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
            )}
           
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Profile; 
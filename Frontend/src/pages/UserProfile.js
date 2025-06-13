import React, { useState } from 'react';
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

const UserProfile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    bloodType: 'A+',
    phone: '0123456789',
    email: 'nguyenvana@email.com',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    weight: '65',
    height: '170',
    medicalHistory: '',
    allergies: '',
  });

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

  const handleSubmit = () => {
    // Xử lý cập nhật thông tin
    console.log('Form submitted:', formData);
    handleCloseDialog();
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
                <Typography variant="body2">
                  <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 1 }} />
                  {formData.address}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Thông tin cá nhân
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Ngày sinh: {formData.dateOfBirth}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Giới tính: {formData.gender === 'male' ? 'Nam' : 'Nữ'}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Cân nặng: {formData.weight} kg
                </Typography>
                <Typography variant="body2">
                  Chiều cao: {formData.height} cm
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Lịch sử hiến máu */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
                <Tab label="Lịch sử hiến máu" />
                <Tab label="Lịch hiến máu tiếp theo" />
              </Tabs>

              {tabValue === 0 && (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Ngày hiến</TableCell>
                        <TableCell>Địa điểm</TableCell>
                        <TableCell>Nhóm máu</TableCell>
                        <TableCell>Lượng máu</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        <TableCell>Lần hiến tiếp theo</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {donationHistory.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.location}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.bloodType}
                              color="error"
                              size="small"
                            />
                          </TableCell>
                          <TableCell>{row.volume} ml</TableCell>
                          <TableCell>{getStatusChip(row.status)}</TableCell>
                          <TableCell>{row.nextDonationDate}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {tabValue === 1 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Lần hiến máu tiếp theo của bạn có thể thực hiện sau ngày{' '}
                    {donationHistory[0].nextDonationDate}
                  </Alert>

                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Lưu ý trước khi hiến máu
                      </Typography>
                      <Typography variant="body2" paragraph>
                        1. Đảm bảo sức khỏe tốt, không mắc các bệnh truyền nhiễm
                      </Typography>
                      <Typography variant="body2" paragraph>
                        2. Cân nặng đạt yêu cầu (nam ≥ 45kg, nữ ≥ 45kg)
                      </Typography>
                      <Typography variant="body2" paragraph>
                        3. Không uống rượu bia, chất kích thích trước khi hiến máu
                      </Typography>
                      <Typography variant="body2" paragraph>
                        4. Ăn nhẹ và uống đủ nước trước khi hiến máu
                      </Typography>
                      <Typography variant="body2">
                        5. Mang theo CMND/CCCD khi đi hiến máu
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog chỉnh sửa thông tin */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa thông tin cá nhân</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Họ và tên"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày sinh"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  label="Giới tính"
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <MenuItem value="male">Nam</MenuItem>
                  <MenuItem value="female">Nữ</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nhóm máu</InputLabel>
                <Select
                  value={formData.bloodType}
                  label="Nhóm máu"
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value })
                  }
                >
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Cân nặng (kg)"
                type="number"
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Chiều cao (cm)"
                type="number"
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiền sử bệnh"
                multiline
                rows={2}
                value={formData.medicalHistory}
                onChange={(e) =>
                  setFormData({ ...formData, medicalHistory: e.target.value })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Dị ứng"
                multiline
                rows={2}
                value={formData.allergies}
                onChange={(e) =>
                  setFormData({ ...formData, allergies: e.target.value })
                }
              />
            </Grid>
          </Grid>
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
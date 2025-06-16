import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Divider,
} from '@mui/material';
import {
  LocationOn,
  Bloodtype,
  Phone,
  Email,
  Directions,
  FilterList,
} from '@mui/icons-material';

const SearchByDistance = () => {
  const [searchType, setSearchType] = useState('donor'); // 'donor' hoặc 'receiver'
  const [bloodType, setBloodType] = useState('');
  const [distance, setDistance] = useState(10);
  const [location, setLocation] = useState('');

  // Dữ liệu mẫu
  const mockDonors = [
    {
      id: 1,
      name: 'Nguyễn Văn A',
      bloodType: 'A+',
      distance: 2.5,
      lastDonation: '2024-01-15',
      location: 'Quận 1, TP.HCM',
      phone: '0123456789',
      email: 'nguyenvana@email.com',
      avatar: 'A',
    },
    {
      id: 2,
      name: 'Trần Thị B',
      bloodType: 'O+',
      distance: 3.8,
      lastDonation: '2024-02-20',
      location: 'Quận 3, TP.HCM',
      phone: '0987654321',
      email: 'tranthib@email.com',
      avatar: 'B',
    },
  ];

  const mockReceivers = [
    {
      id: 1,
      name: 'Bệnh viện Chợ Rẫy',
      bloodType: 'B+',
      distance: 1.2,
      urgency: 'Khẩn cấp',
      location: 'Quận 5, TP.HCM',
      phone: '02838554137',
      email: 'contact@choray.vn',
      avatar: 'CR',
    },
    {
      id: 2,
      name: 'Bệnh viện Nhi Đồng 1',
      bloodType: 'O-',
      distance: 4.5,
      urgency: 'Bình thường',
      location: 'Quận 10, TP.HCM',
      phone: '02839271119',
      email: 'contact@nhi1.vn',
      avatar: 'N1',
    },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Tìm kiếm theo khoảng cách
      </Typography>

      {/* Bộ lọc tìm kiếm */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Loại tìm kiếm</InputLabel>
                <Select
                  value={searchType}
                  label="Loại tìm kiếm"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <MenuItem value="donor">Tìm người hiến máu</MenuItem>
                  <MenuItem value="receiver">Tìm người cần máu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Nhóm máu</InputLabel>
                <Select
                  value={bloodType}
                  label="Nhóm máu"
                  onChange={(e) => setBloodType(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Vị trí của bạn"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhập địa chỉ của bạn"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography gutterBottom>Khoảng cách tối đa: {distance} km</Typography>
              <Slider
                value={distance}
                onChange={(e, newValue) => setDistance(newValue)}
                min={1}
                max={50}
                valueLabelDisplay="auto"
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<FilterList />}
                fullWidth
                size="large"
              >
                Tìm kiếm
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Kết quả tìm kiếm */}
      <Grid container spacing={3}>
        {(searchType === 'donor' ? mockDonors : mockReceivers).map((item) => (
          <Grid item xs={12} key={item.id}>
            <Card>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{
                        bgcolor: searchType === 'donor' ? 'primary.main' : 'error.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      {item.avatar}
                    </Avatar>
                  </Grid>

                  <Grid item xs>
                    <Typography variant="h6" gutterBottom>
                      {item.name}
                    </Typography>

                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Chip
                        icon={<Bloodtype />}
                        label={`Nhóm máu ${item.bloodType}`}
                        color="error"
                        size="small"
                      />
                      <Chip
                        icon={<LocationOn />}
                        label={`${item.distance} km`}
                        color="primary"
                        size="small"
                      />
                      {searchType === 'receiver' && (
                        <Chip
                          label={item.urgency}
                          color={item.urgency === 'Khẩn cấp' ? 'error' : 'warning'}
                          size="small"
                        />
                      )}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {item.location}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {item.phone}
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                      {item.email}
                    </Typography>

                    {searchType === 'donor' && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Lần hiến máu gần nhất: {item.lastDonation}
                      </Typography>
                    )}
                  </Grid>

                  <Grid item>
                    <IconButton color="primary" size="large">
                      <Directions />
                    </IconButton>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default SearchByDistance; 
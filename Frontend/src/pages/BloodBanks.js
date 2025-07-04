import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Button,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Phone as PhoneIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';

const bloodBanks = [
  {
    id: 1,
    name: 'Bệnh viện Chợ Rẫy',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
    phone: '028 3855 4137',
    email: 'contact@choray.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
  },
  {
    id: 2,
    name: 'Bệnh viện Nhân dân 115',
    address: '527 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
    phone: '028 3865 4249',
    email: 'info@benhvien115.com.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
  },
  {
    id: 3,
    name: 'Bệnh viện Đại học Y Dược',
    address: '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM',
    phone: '028 3855 8411',
    email: 'info@bvdaihocyduoc.com.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
  },
  {
    id: 4,
    name: 'Viện Huyết học - Truyền máu Trung ương',
    address: '14 Trần Thái Tông, Cầu Giấy, Hà Nội',
    phone: '024 3784 2141',
    email: 'contact@viethuyethoc.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']
  }
];

const BloodBanks = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBloodType, setSelectedBloodType] = useState('all');

  const filteredBloodBanks = bloodBanks.filter(bank => {
    const matchesSearch = bank.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         bank.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBloodType = selectedBloodType === 'all' || bank.bloodTypes.includes(selectedBloodType);
    return matchesSearch && matchesBloodType;
  });

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Danh sách ngân hàng máu
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Tìm kiếm và lọc danh sách các ngân hàng máu trên toàn quốc
        </Typography>

        {/* Search and Filter Section */}
        <Card sx={{ mb: 4, p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Tìm kiếm bệnh viện..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={() => setSelectedBloodType('all')}
                  color={selectedBloodType === 'all' ? 'primary' : 'inherit'}
                >
                  Tất cả
                </Button>
                {['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'].map((type) => (
                  <Button
                    key={type}
                    variant="outlined"
                    onClick={() => setSelectedBloodType(type)}
                    color={selectedBloodType === type ? 'primary' : 'inherit'}
                  >
                    {type}
                  </Button>
                ))}
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Blood Banks List */}
        <Grid container spacing={3}>
          {filteredBloodBanks.map((bank) => (
            <Grid item xs={12} md={6} key={bank.id}>
              <Card sx={{ 
                height: '100%', 
                transition: 'all 0.3s ease',
                '&:hover': { 
                  transform: 'translateY(-4px)', 
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)' 
                }
              }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {bank.name}
                  </Typography>
                  <Stack spacing={1.5}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LocationOnIcon color="action" />
                      <Typography variant="body2">{bank.address}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PhoneIcon color="action" />
                      <Typography variant="body2">{bank.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmailIcon color="action" />
                      <Typography variant="body2">{bank.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <AccessTimeIcon color="action" />
                      <Typography variant="body2">{bank.workingHours}</Typography>
                    </Box>
                    <Divider sx={{ my: 1 }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Nhóm máu có sẵn:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {bank.bloodTypes.map((type) => (
                          <Chip 
                            key={type} 
                            label={type} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => navigate(`/events?hospitalId=${bank.id}`)}
                      >
                        Xem sự kiện
                      </Button>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BloodBanks; 
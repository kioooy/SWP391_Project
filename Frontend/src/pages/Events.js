import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Divider
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  LocalHospital as HospitalIcon,
  Event as EventIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { fetchEvents, bookEvent, selectEvents, selectEventsLoading, selectEventsError, selectBookingStatus, clearBookingStatus } from '../features/events/eventsSlice';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';

const bloodBanks = [
  {
    id: 1,
    name: 'Bệnh viện Chợ Rẫy',
    address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
    phone: '028 3855 4137',
    email: 'contact@choray.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'],
    events: [
      {
        id: 1,
        title: 'Hiến máu nhân đạo',
        date: '2024-03-20',
        startTime: '08:00',
        endTime: '17:00',
        currentDonors: 45,
        maxDonors: 100,
        bloodTypes: ['A+', 'B+', 'O+', 'AB+']
      }
    ]
  },
  {
    id: 2,
    name: 'Bệnh viện Nhân dân 115',
    address: '527 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
    phone: '028 3865 4249',
    email: 'info@benhvien115.com.vn',
    workingHours: '7:00 - 17:00',
    bloodTypes: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'],
    events: [
      {
        id: 2,
        title: 'Hiến máu tình nguyện',
        date: '2024-03-22',
        startTime: '08:00',
        endTime: '17:00',
        currentDonors: 30,
        maxDonors: 80,
        bloodTypes: ['B+', 'O+', 'AB+']
      }
    ]
  }
];

const Events = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBloodType, setSelectedBloodType] = useState('all');
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);
  const bookingStatus = useSelector(selectBookingStatus);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromDate = params.get('fromDate');
    const toDate = params.get('toDate');
    
    if (fromDate && toDate) {
      dispatch(fetchEvents({ fromDate, toDate }));
    }
  }, [location.search, dispatch]);

  useEffect(() => {
    if (bookingStatus === 'success') {
      const timer = setTimeout(() => {
        dispatch(clearBookingStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus, dispatch]);

  const handleBookEvent = (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(bookEvent({ eventId, userId: user.id }));
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

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
          Tìm kiếm sự kiện hiến máu
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
              <Stack direction="row" spacing={2}>
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

        {/* Tabs */}
        <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
          <Tab icon={<HospitalIcon />} label="Bệnh viện" />
          <Tab icon={<EventIcon />} label="Sự kiện" />
        </Tabs>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {bookingStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {selectedTab === 0 ? (
              // Blood Banks List
              <Grid container spacing={3}>
                {filteredBloodBanks.map((bank) => (
                  <Grid item xs={12} key={bank.id}>
                    <Card sx={{ transition: 'all 0.3s ease', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 24px rgba(0,0,0,0.12)' } }}>
                      <CardContent>
                        <Grid container spacing={3}>
                          <Grid item xs={12} md={8}>
                            <Typography variant="h6" color="primary" gutterBottom>
                              {bank.name}
                            </Typography>
                            <Stack spacing={1.5}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LocationOnIcon color="action" />
                                <Typography variant="body2">{bank.address}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon color="action" />
                                <Typography variant="body2">{bank.workingHours}</Typography>
                              </Box>
                              <Box sx={{ mt: 1 }}>
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
                            </Stack>
                          </Grid>
                          <Grid item xs={12} md={4}>
                            <Typography variant="subtitle1" gutterBottom>
                              Sự kiện sắp tới:
                            </Typography>
                            {bank.events.map((event) => (
                              <Card key={event.id} variant="outlined" sx={{ mb: 2 }}>
                                <CardContent>
                                  <Typography variant="subtitle2" gutterBottom>
                                    {event.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {dayjs(event.date).format('DD/MM/YYYY')} - {event.startTime} đến {event.endTime}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Đã đăng ký: {event.currentDonors}/{event.maxDonors}
                                  </Typography>
                                  <Button
                                    variant="contained"
                                    size="small"
                                    fullWidth
                                    sx={{ mt: 1 }}
                                    onClick={() => handleBookEvent(event.id)}
                                    disabled={event.currentDonors >= event.maxDonors}
                                  >
                                    Đăng ký tham gia
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Events List
              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {event.title}
                        </Typography>
                        <Stack spacing={1}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOnIcon color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {event.location} - {event.address}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccessTimeIcon color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {dayjs(event.startDate).format('DD/MM/YYYY')} - {event.startTime} đến {event.endTime}
                            </Typography>
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Nhóm máu cần: {event.bloodTypes.join(', ')}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Số lượng đăng ký: {event.currentDonors}/{event.maxDonors}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleBookEvent(event.id)}
                              disabled={event.currentDonors >= event.maxDonors}
                            >
                              Đăng ký tham gia
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default Events; 
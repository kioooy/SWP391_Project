import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Typography, Grid, Card, CardContent, Button, Box, Avatar, Stack } from '@mui/material';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const bloodDonationLocations = [
  {
    id: 1,
    name: 'Hiến máu - 466 Nguyễn Thị Minh Khai',
    address: '466 Nguyễn Thị Minh Khai, Quận 3, Tp Hồ Chí Minh',
    date: '2025-05-27',
    time: '07:00 - 11:30',
    registered: 44,
    capacity: 150,
  },
  {
    id: 2,
    name: 'Hiến máu - Trung Tâm Hiến Máu Nhân Đạo Tp.HCM',
    address: '106 Thiên Phước, Quận Tân Bình, TP.HCM',
    date: '2025-05-27',
    time: '07:00 - 16:30',
    registered: 41,
    capacity: 150,
  },
  // ... thêm các điểm khác nếu muốn
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const Events = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const from = query.get('from');
  const to = query.get('to');

  const handleBooking = (locationId) => {
    const isAuthenticated = localStorage.getItem('token') !== null || localStorage.getItem('isTestUser') === 'true';
    if (isAuthenticated) {
      navigate('/booking');
    } else {
      navigate('/login');
      return;
    }
    dispatch(bookEvent({ eventId, userId: user.id }));
  };

  let results = [];
  if (from && to) {
    const fromDate = dayjs(from);
    const toDate = dayjs(to);
    results = bloodDonationLocations.filter((loc) => {
      const locDate = dayjs(loc.date);
      return locDate.isSameOrAfter(fromDate) && locDate.isSameOrBefore(toDate);
    });
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f6f8fa', py: 6 }}>
      <Container maxWidth="md">
        <Box textAlign="center" mb={4}>
          <EventAvailableIcon color="primary" sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
            Danh sách địa điểm hiến máu phù hợp
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {from && to
              ? `Từ ngày ${dayjs(from).format('DD/MM/YYYY')} đến ngày ${dayjs(to).format('DD/MM/YYYY')}`
              : 'Vui lòng chọn khoảng ngày ở trang chủ.'}
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
        <Grid container spacing={4}>
          {results.length > 0 ? results.map((loc) => (
            <Grid item xs={12} md={6} key={loc.id}>
              <Card sx={{ borderRadius: 3, boxShadow: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <EventAvailableIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" color="primary" fontWeight="bold">{loc.name}</Typography>
                      <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                        <LocationOnIcon color="action" fontSize="small" />
                        <Typography variant="body2" color="text.secondary">{loc.address}</Typography>
                      </Stack>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <EventAvailableIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {dayjs(loc.date).format('DD/MM/YYYY')} - {loc.time}
                    </Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <PeopleIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Số lượng đăng ký: <b>{loc.registered}/{loc.capacity}</b> Người
                    </Typography>
                  </Stack>
                </CardContent>
                <Box textAlign="right" p={2} pt={0}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleBooking(loc.id)}
                  >
                    Đặt lịch
                  </Button>
                </Box>
                        </Stack>
                      </CardContent>
              </Card>
            </Grid>
          )) : (
            <Grid item xs={12}>
              <Box textAlign="center" py={6}>
                <EventAvailableIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Tạm thời chưa có nơi tổ chức hiến máu phù hợp trong khoảng thời gian này.
                </Typography>
              </Box>
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Events;

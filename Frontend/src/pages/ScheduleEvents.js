import React, { useEffect } from 'react';
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
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  LocationOn as LocationOnIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import dayjs from 'dayjs';
import { fetchEvents, bookEvent, selectEvents, selectEventsLoading, selectEventsError, selectBookingStatus, clearBookingStatus } from '../features/events/eventsSlice';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';

const ScheduleEvents = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    } else if (bookingStatus === 'failed') {
       // Optionally show error message for booking failed
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

  const params = new URLSearchParams(location.search);
  const fromDate = params.get('fromDate');
  const toDate = params.get('toDate');

  return (
    <Box sx={{ bgcolor: '#1976d2', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Sự kiện hiến máu từ {fromDate ? dayjs(fromDate).format('DD/MM/YYYY') : ''} đến {toDate ? dayjs(toDate).format('DD/MM/YYYY') : ''}
        </Typography>

        {error && !bookingStatus && ( // Show fetch error only
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

         {bookingStatus === 'success' && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
          </Alert>
        )}

        {bookingStatus === 'failed' && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Đăng ký thất bại. Vui lòng thử lại sau.
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {events.length > 0 ? (events.map((event) => (
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
                          disabled={event.currentDonors >= event.maxDonors || bookingStatus === 'pending'}
                        >
                          {bookingStatus === 'pending' ? <CircularProgress size={24} /> : 'Đăng ký tham gia'}
                        </Button>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))) : (
              <Grid item xs={12}>
                <Typography variant="h6" color="text.secondary" align="center">
                  Không tìm thấy sự kiện nào trong khoảng thời gian này.
                </Typography>
              </Grid>
            )}
          </Grid>
        )}
      </Container>
    </Box>
  );
};

export default ScheduleEvents; 
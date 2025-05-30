import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Container, TextField, Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, ListItemText, ListItemIcon, Divider, Chip } from '@mui/material';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LocalCafeIcon from '@mui/icons-material/LocalCafe';
import ScaleIcon from '@mui/icons-material/Scale';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import StraightenIcon from '@mui/icons-material/Straighten';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import PermContactCalendarIcon from '@mui/icons-material/PermContactCalendar';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAuthenticated, selectUser } from '../features/auth/authSlice';
import { fetchEvents, bookEvent, selectEvents, selectEventsLoading, selectEventsError, selectBookingStatus, clearBookingStatus } from '../features/events/eventsSlice';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';

const stats = [
  { icon: <BloodtypeIcon color="primary" sx={{ fontSize: 40 }} />, label: 'Đơn vị máu đã tiếp nhận', value: '12,345+' },
  { icon: <VolunteerActivismIcon color="secondary" sx={{ fontSize: 40 }} />, label: 'Người hiến máu', value: '8,900+' },
  { icon: <EventIcon color="error" sx={{ fontSize: 40 }} />, label: 'Sự kiện đã tổ chức', value: '120+' },
];

const benefits = [
  {
    icon: <FavoriteIcon sx={{ fontSize: 40, color: '#e53935' }} />,
    title: 'Sức khỏe được kiểm tra',
    description: 'Được khám và tư vấn sức khỏe miễn phí, phát hiện sớm các bệnh lý về máu'
  },
  {
    icon: <LocalHospitalIcon sx={{ fontSize: 40, color: '#e53935' }} />,
    title: 'Ưu tiên khi cần máu',
    description: 'Được ưu tiên cấp máu khi cần truyền máu với số lượng tương đương lượng máu đã hiến'
  },
  {
    icon: <CardGiftcardIcon sx={{ fontSize: 40, color: '#e53935' }} />,
    title: 'Nhận quà tặng',
    description: 'Nhận quà tặng và giấy chứng nhận hiến máu tình nguyện sau mỗi lần hiến máu'
  },
  {
    icon: <EmojiEventsIcon sx={{ fontSize: 40, color: '#e53935' }} />,
    title: 'Vinh danh',
    description: 'Được vinh danh và khen thưởng khi đạt các cột mốc hiến máu tình nguyện'
  }
];

const eligibilityCriteria = [
  {
    icon: <PersonOutlineIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Mang theo chứng minh nhân dân/hộ chiếu'
  },
  {
    icon: <LocalCafeIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Không nghiện ma túy, rượu bia và các chất kích thích'
  },
  {
    icon: <ScaleIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Cân nặng: Nam ≥ 45 Kg; Nữ ≥ 45 kg'
  },
  {
    icon: <MonitorHeartIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Không mắc các bệnh mãn tính hoặc cấp tính về tim mạch, huyết áp, hô hấp, dạ dày...'
  },
  {
    icon: <StraightenIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Chỉ số huyết sắc tố (Hb) ≥120g/l (≥125g/l nếu hiến từ 350ml trở lên).'
  },
  {
    icon: <PermContactCalendarIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Thời gian tối thiểu giữa 2 lần hiến máu là 12 tuần đối với cả Nam và Nữ'
  },
  {
    icon: <SpellcheckIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Kết quả test nhanh âm tính với kháng nguyên bề mặt của siêu vi B'
  },
  {
    icon: <LocalHospitalIcon sx={{ fontSize: 30, color: '#1976d2' }} />,
    description: 'Không mắc hoặc không có hành vi nguy cơ lây nhiễm HIV, không nhiễm viêm gan B, viêm gan C, và các virus lây qua đường truyền máu'
  }
];

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

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const events = useSelector(selectEvents);
  const loading = useSelector(selectEventsLoading);
  const error = useSelector(selectEventsError);
  const bookingStatus = useSelector(selectBookingStatus);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [openBloodBanks, setOpenBloodBanks] = useState(false);

  useEffect(() => {
    if (bookingStatus === 'success') {
      const timer = setTimeout(() => {
        dispatch(clearBookingStatus());
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus, dispatch]);

  const handleLogin = () => {
    if (isAuthenticated) {
      const scheduleSection = document.getElementById('schedule-section');
      if (scheduleSection) {
        scheduleSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/login');
    }
  };

  const handleSearch = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!fromDate || !toDate) return;
    const searchParams = new URLSearchParams({
      fromDate: dayjs(fromDate).format('YYYY-MM-DD'),
      toDate: dayjs(toDate).format('YYYY-MM-DD')
    });
    navigate(`/schedule-events?${searchParams.toString()}`);
  };

  const handleBookEvent = (eventId) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    dispatch(bookEvent({ eventId, userId: user.id }));
  };

  const handleOpenBloodBanks = () => {
    setOpenBloodBanks(true);
  };

  const handleCloseBloodBanks = () => {
    setOpenBloodBanks(false);
  };

  return (
    <Box sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', pt: 0 }}>
      {/* Banner/Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: 350,
          background: 'linear-gradient(135deg, #e53935 0%, #ff6b6b 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 6,
          px: { xs: 2, md: 0 },
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
            animation: 'pulse 4s ease-in-out infinite',
          },
          '@keyframes pulse': {
            '0%': { transform: 'scale(1)' },
            '50%': { transform: 'scale(1.1)' },
            '100%': { transform: 'scale(1)' },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4, position: 'relative', zIndex: 1 }}>
          <Box>
            <Typography 
              variant="h3" 
              color="#fff" 
              fontWeight={700} 
              gutterBottom
              sx={{
                textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                animation: 'fadeInUp 1s ease-out',
                '@keyframes fadeInUp': {
                  '0%': { opacity: 0, transform: 'translateY(20px)' },
                  '100%': { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              Hiến máu cứu người<br />
              <span style={{ color: '#ffd600', textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>Một giọt máu cho đi, một cuộc đời ở lại</span>
            </Typography>
            <Typography 
              variant="h6" 
              color="#fff" 
              mb={3}
              sx={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
                animation: 'fadeInUp 1s ease-out 0.2s',
                animationFillMode: 'both',
              }}
            >
              Chung tay vì cộng đồng khỏe mạnh, hạnh phúc hơn!
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button 
                variant="contained" 
                color="secondary" 
                size="large" 
                onClick={handleLogin}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                  },
                }}
              >
                Đăng ký hiến máu
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                onClick={handleOpenBloodBanks}
                sx={{
                  borderRadius: '30px',
                  px: 4,
                  py: 1.5,
                  borderWidth: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    borderWidth: 2,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Tìm ngân hàng máu
              </Button>
            </Stack>
          </Box>
          <Box 
            sx={{ 
              display: { xs: 'none', md: 'block' }
            }}
          >
            <img 
              src="/assets/3.jpg" 
              alt="banner" 
              style={{ 
                maxHeight: 300, 
                borderRadius: 16, 
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                },
              }} 
            />
          </Box>
        </Container>
      </Box>

      {/* Thống kê nhanh */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  py: 4, 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  borderRadius: 4,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  },
                }}
              >
                <CardContent>
                  {item.icon}
                  <Typography 
                    variant="h5" 
                    fontWeight={700} 
                    sx={{ 
                      mt: 2,
                      background: 'linear-gradient(45deg, #1976d2, #2196f3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {item.value}
                  </Typography>
                  <Typography color="text.secondary">{item.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Đặt lịch hiến máu */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#fff',
          py: 8,
          mb: 8,
          borderRadius: '30px 30px 0 0',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
        }}
        id="schedule-section"
      >
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Bạn cần đặt lịch hiến máu vào thời gian nào?
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box display="flex" alignItems="center" gap={2} sx={{ mt: 2 }}>
              <DatePicker
                label="Từ ngày"
                value={fromDate}
                onChange={setFromDate}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <DatePicker
                label="Đến ngày"
                value={toDate}
                onChange={setToDate}
                renderInput={(params) => <TextField {...params} size="small" />}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={!fromDate || !toDate || loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Tìm kiếm'}
              </Button>
            </Box>
          </LocalizationProvider>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {bookingStatus === 'success' && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Đăng ký thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất.
            </Alert>
          )}

          {bookingStatus === 'failed' && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {events.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Danh sách sự kiện hiến máu
              </Typography>
              <Grid container spacing={2}>
                {events.map((event) => (
                  <Grid item xs={12} key={event.id}>
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
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {event.description}
                          </Typography>
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => handleBookEvent(event.id)}
                              disabled={event.currentDonors >= event.maxDonors || loading}
                            >
                              {loading ? <CircularProgress size={24} /> : 'Đăng ký tham gia'}
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Container>
      </Box>

      {/* Dialog hiển thị danh sách ngân hàng máu */}
      <Dialog 
        open={openBloodBanks} 
        onClose={handleCloseBloodBanks}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" color="primary">
            Danh sách ngân hàng máu
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {bloodBanks.map((bank, index) => (
              <React.Fragment key={bank.id}>
                <ListItem alignItems="flex-start" sx={{ flexDirection: 'column', py: 2 }}>
                  <Typography variant="h6" color="primary" gutterBottom>
                    {bank.name}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack spacing={1}>
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
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
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
                    </Grid>
                  </Grid>
                </ListItem>
                {index < bloodBanks.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBloodBanks} color="primary">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Giới thiệu */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
          Vì sao bạn nên hiến máu?
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Hiến máu là nghĩa cử cao đẹp, giúp cứu sống hàng ngàn người mỗi năm. Mỗi giọt máu bạn cho đi là hy vọng sống cho những bệnh nhân đang cần truyền máu. Hãy cùng chung tay xây dựng cộng đồng khỏe mạnh, nhân ái và sẻ chia.
        </Typography>

        {/* Quyền lợi người hiến máu */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
            Quyền lợi của người hiến máu
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3 }}>
                  {benefit.icon}
                  <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                    {benefit.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {benefit.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Tiêu chuẩn tham gia hiến máu */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#1976d2',
          py: 8,
          mb: 8,
          color: '#fff',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} direction="column" alignItems="center">
            {/* Title */}
            <Grid item xs={12}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: '#ffd600', textAlign: 'center' }}>
                Tiêu chuẩn tham gia hiến máu
              </Typography>
            </Grid>
            {/* Criteria Grid */}
            <Grid item xs={12}>
              <Grid container spacing={2}>
                {eligibilityCriteria.map((criterion, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card sx={{ height: '100%', p: 2 }}>
                      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, padding: '8px !important' }}>
                        {criterion.icon}
                        <Typography variant="body1">
                          {criterion.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Lưu ý quan trọng */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
          Lưu ý quan trọng
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <Typography variant="h6" fontWeight={600}>Ai có thể tham gia hiến máu?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                - Tất cả mọi người từ 18 - 60 tuổi, thực sự tình nguyện hiến máu của mình để cứu chữa người bệnh.<br />
                - Cân nặng ít nhất là 45kg đối với phụ nữ, nam giới. Lượng máu hiến mỗi lần không quá 9ml/kg cân nặng và không quá 500ml mỗi lần.<br />
                - Không bị nhiễm hoặc không có các hành vi lây nhiễm HIV và các bệnh lây nhiễm qua đường truyền máu khác.<br />
                - Thời gian giữa 2 lần hiến máu là 12 tuần đối với cả Nam và Nữ.<br />
                - Có giấy tờ tùy thân.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel2a-content"
              id="panel2a-header"
            >
              <Typography variant="h6" fontWeight={600}>Ai là người không nên hiến máu?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                - Người đã nhiễm hoặc đã thực hiện hành vi có nguy cơ nhiễm HIV, viêm gan B, viêm gan C, và các virus lây qua đường truyền máu.<br />
                - Người có các bệnh mãn tính: tim mạch, huyết áp, hô hấp, dạ dày...
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel3a-content"
              id="panel3a-header"
            >
              <Typography variant="h6" fontWeight={600}>Máu của tôi sẽ được làm những xét nghiệm gì?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                - Tất cả những đơn vị máu thu được sẽ được kiểm tra nhóm máu (hệ ABO, hệ Rh), virus viêm gan B, virus viêm gan C, giang mai, sốt rét.<br />
                - Bạn sẽ được thông báo kết quả, được giữ kín và được tư vấn (miễn phí) khi phát hiện ra các bệnh nhiễm trùng nói trên.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: '#e53935', color: '#fff', py: 4, mt: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" fontWeight={700}>
                Hệ thống quản lý hiến máu
              </Typography>
              <Typography variant="body2">
                Địa chỉ: 123 Đường Hiến Máu, Quận 1, TP.HCM<br />
                Điện thoại: 0123 456 789<br />
                Email: lienhe@hienmau.vn
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <img
                  src="/assets/logo.png"
                  alt="Logo"
                  style={{ height: 32, width: 32, borderRadius: 6, objectFit: 'cover', marginRight: 10, background: '#fff', cursor: 'pointer' }}
                  onClick={() => window.location.reload()}
                />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  © {new Date().getFullYear()} Blood Donation. All rights reserved.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 
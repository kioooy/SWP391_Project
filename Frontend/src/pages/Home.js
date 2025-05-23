import React from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, Stack, Container } from '@mui/material';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EventIcon from '@mui/icons-material/Event';

const stats = [
  { icon: <BloodtypeIcon color="primary" sx={{ fontSize: 40 }} />, label: 'Đơn vị máu đã tiếp nhận', value: '12,345+' },
  { icon: <VolunteerActivismIcon color="secondary" sx={{ fontSize: 40 }} />, label: 'Người hiến máu', value: '8,900+' },
  { icon: <EventIcon color="error" sx={{ fontSize: 40 }} />, label: 'Sự kiện đã tổ chức', value: '120+' },
];

const Home = () => {
  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pt: 0 }}>
      {/* Banner/Hero Section */}
      <Box
        sx={{
          width: '100%',
          minHeight: 350,
          background: 'linear-gradient(90deg, #e53935 60%, #fff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 6,
        }}
      >
        <Container maxWidth="lg" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h3" color="#fff" fontWeight={700} gutterBottom>
              Hiến máu cứu người<br />
              <span style={{ color: '#ffd600' }}>Một giọt máu cho đi, một cuộc đời ở lại</span>
            </Typography>
            <Typography variant="h6" color="#fff" mb={3}>
              Chung tay vì cộng đồng khỏe mạnh, hạnh phúc hơn!
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button variant="contained" color="secondary" size="large">
                Đăng ký hiến máu
              </Button>
              <Button variant="outlined" color="inherit" size="large">
                Tìm ngân hàng máu
              </Button>
            </Stack>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'block' } }}>
            {/* Placeholder cho ảnh banner */}
            <img src="/assets/banner-blood.png" alt="banner" style={{ maxHeight: 300, borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }} />
          </Box>
        </Container>
      </Box>

      {/* Thống kê nhanh */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Grid container spacing={4} justifyContent="center">
          {stats.map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card sx={{ textAlign: 'center', py: 4, boxShadow: 2 }}>
                <CardContent>
                  {item.icon}
                  <Typography variant="h5" fontWeight={700} sx={{ mt: 2 }}>
                    {item.value}
                  </Typography>
                  <Typography color="text.secondary">{item.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Giới thiệu */}
      <Container maxWidth="md" sx={{ mb: 8 }}>
        <Typography variant="h4" align="center" fontWeight={700} gutterBottom>
          Vì sao bạn nên hiến máu?
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary">
          Hiến máu là nghĩa cử cao đẹp, giúp cứu sống hàng ngàn người mỗi năm. Mỗi giọt máu bạn cho đi là hy vọng sống cho những bệnh nhân đang cần truyền máu. Hãy cùng chung tay xây dựng cộng đồng khỏe mạnh, nhân ái và sẻ chia.
        </Typography>
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
              <Typography variant="body2">
                © {new Date().getFullYear()} Blood Donation System. All rights reserved.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 
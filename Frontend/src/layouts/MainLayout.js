import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
}));

const MainLayout = () => {
  const navigate = useNavigate();
  return (
    <MainContainer>
      <AppBar position="static">
        <Toolbar sx={{ position: 'relative' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <img
              src="/assets/logo.png"
              alt="Logo"
              style={{
                height: 32,
                width: 32,
                borderRadius: 6,
                objectFit: 'cover',
                marginRight: 10,
                background: '#fff',
                cursor: 'pointer'
              }}
              onClick={() => navigate('/')} 
            />
            <Typography variant="h6" component="div" sx={{ fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }} onClick={() => navigate('/') }>
              Blood Donation
            </Typography>
          </Box>
          <Box
            sx={{
              position: 'absolute',
              left: '50%',
              top: 0,
              bottom: 0,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}
          >
            <Button color="inherit" onClick={() => navigate('/faq')}>Hỏi - Đáp</Button>
            <Button color="inherit" onClick={() => navigate('/news')}>Tin Tức</Button>
            <Button color="inherit" onClick={() => navigate('/contact')}>Liên Hệ</Button>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => navigate('/login')}
            sx={{ fontWeight: 700, borderRadius: 8 }}
          >
            Đăng nhập
          </Button>
        </Toolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
    </MainContainer>
  );
};

export default MainLayout; 
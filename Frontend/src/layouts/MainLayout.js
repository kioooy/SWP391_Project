import React from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import NewsIcon from '@mui/icons-material/Article';
import ContactIcon from '@mui/icons-material/ContactMail';
import { logout } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';
import Footer from '../components/Footer';

const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
}));

const StyledLink = styled(RouterLink)(({ theme }) => ({
  color: 'inherit',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'none',
  },
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})(({ theme, isActive }) => ({
  color: 'inherit',
  textTransform: 'none',
  minWidth: 'auto',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  ...(isActive && {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    fontWeight: 'bold',
  }),
}));

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const menuItems = [
    { path: '/', label: 'Trang Chủ', icon: <HomeIcon /> },
    { path: '/appointment-history', label: 'Lịch Sử Đặt Hẹn', icon: <HistoryIcon /> },
    { path: '/faq', label: 'Hỏi & Đáp', icon: <QuestionAnswerIcon /> },
    { path: '/news', label: 'Tin Tức', icon: <NewsIcon /> },
    { path: '/contact', label: 'Liên Hệ', icon: <ContactIcon /> },
  ];

  return (
    <MainContainer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ mr: 4 }}>
            Hệ Thống Hiến Máu
          </Typography>

          <Stack direction="row" spacing={1} sx={{ flexGrow: 1 }}>
            {menuItems.map((item) => (
              <NavButton
                key={item.path}
                component={StyledLink}
                to={item.path}
                startIcon={item.icon}
                isActive={location.pathname === item.path}
              >
                {item.label}
              </NavButton>
            ))}
          </Stack>

          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{
                ml: 2,
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                sx={{
                  ml: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  }
                }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                onClick={handleSignup}
                sx={{
                  ml: 1,
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  color: 'inherit',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.8)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }
                }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
      <Footer />
    </MainContainer>
  );
};

export default MainLayout; 
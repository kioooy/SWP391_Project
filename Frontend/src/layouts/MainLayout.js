import React from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { logout } from '../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../features/auth/authSlice';

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
  marginRight: theme.spacing(2),
  '&:hover': {
    textDecoration: 'none',
  },
}));

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
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

  return (
    <MainContainer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Hệ Thống Hiến Máu
          </Typography>
          <Button
            component={StyledLink}
            to="/faq"
            startIcon={<QuestionAnswerIcon />}
            color="inherit"
          >
            Hỏi & Đáp
          </Button>
          {isAuthenticated ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleLogout}
              sx={{ ml: 2 }}
            >
              Logout
            </Button>
          ) : (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogin}
                sx={{ ml: 2 }}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={handleSignup}
                sx={{ ml: 2 }}
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
    </MainContainer>
  );
};

export default MainLayout; 
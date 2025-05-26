import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container, Button } from '@mui/material';
import { styled } from '@mui/material/styles';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';

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
        </Toolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
    </MainContainer>
  );
};

export default MainLayout; 
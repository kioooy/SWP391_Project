import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, AppBar, Toolbar, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

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
  return (
    <MainContainer>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Blood Donation System
          </Typography>
        </Toolbar>
      </AppBar>
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
    </MainContainer>
  );
};

export default MainLayout; 
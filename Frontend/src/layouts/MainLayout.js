import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { styled } from '@mui/material/styles';
import Header from '../components/Header';

const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
  marginTop: theme.spacing(8), // Thêm margin-top để tránh bị header che
}));

const MainLayout = () => {
  return (
    <MainContainer>
      <Header />
      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
    </MainContainer>
  );
};

export default MainLayout; 
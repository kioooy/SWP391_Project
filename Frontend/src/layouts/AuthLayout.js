import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2),
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: 400,
  width: '100%',
}));

const AuthLayout = () => {
  return (
    <AuthContainer maxWidth={false}>
      <AuthPaper elevation={3}>
        <Outlet />
      </AuthPaper>
    </AuthContainer>
  );
};

export default AuthLayout; 
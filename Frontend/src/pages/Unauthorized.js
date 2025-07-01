import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h3" color="error" gutterBottom>
        Không có quyền truy cập
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Bạn không có quyền truy cập vào trang này. Vui lòng liên hệ quản trị viên nếu bạn nghĩ đây là nhầm lẫn.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>Về trang chủ</Button>
    </Box>
  );
};

export default Unauthorized; 
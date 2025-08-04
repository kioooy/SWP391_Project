import React, { useState, useEffect } from 'react';
import { Alert, Box, Typography, Chip } from '@mui/material';
import { CheckCircle, Cancel, Warning, Info } from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5250/api';

const RegistrationStatusCheck = ({ onStatusChange }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkRegistrationStatus();
  }, []);

  const checkRegistrationStatus = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập để kiểm tra trạng thái.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_BASE_URL}/DonationRequest/registration-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Không thể kiểm tra trạng thái đăng ký.');
      }

      const data = await response.json();
      setStatus(data);
      
      // Gọi callback để thông báo cho component cha
      if (onStatusChange) {
        onStatusChange(data);
      }
    } catch (error) {
      console.error('Lỗi khi kiểm tra trạng thái:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Đang kiểm tra trạng thái đăng ký...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    if (status.canRegister) {
      return <CheckCircle color="success" />;
    } else if (status.hasActiveDonation) {
      return <Warning color="warning" />;
    } else {
      return <Cancel color="error" />;
    }
  };

  const getStatusColor = () => {
    if (status.canRegister) return 'success';
    if (status.hasActiveDonation) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Alert 
        severity={getStatusColor()} 
        icon={getStatusIcon()}
        sx={{ mb: 2 }}
      >
        <Typography variant="body2" sx={{ mb: 1 }}>
          {status.message}
        </Typography>
        
        {status.lastDonationDate && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={`Lần hiến gần nhất: ${new Date(status.lastDonationDate).toLocaleDateString('vi-VN')}`}
              color="info"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
            <Chip 
              size="small" 
              label={`Tổng số lần hiến: ${status.donationCount || 0}`}
              color="info"
              variant="outlined"
              sx={{ mr: 1, mb: 1 }}
            />
          </Box>
        )}
        
        {status.recoveryDueDate && (
          <Box sx={{ mt: 1 }}>
            <Chip 
              size="small" 
              label={`Ngày phục hồi: ${new Date(status.recoveryDueDate).toLocaleDateString('vi-VN')}`}
              color="warning"
              variant="outlined"
            />
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default RegistrationStatusCheck; 
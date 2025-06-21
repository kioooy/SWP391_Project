import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  LinearProgress,
  Button,
  Grid
} from '@mui/material';
import { CalendarToday, LocationOn, People } from '@mui/icons-material';
import dayjs from 'dayjs';

const BloodDonationPeriodCard = ({ period, onRegister }) => {
  const formatDate = (dateString) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active':
        return 'Đang diễn ra';
      case 'Completed':
        return 'Đã hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const calculateProgress = () => {
    const current = period.currentQuantity || 0;
    const target = period.targetQuantity;
    return target > 0 ? (current / target) * 100 : 0;
  };

  const isActive = period.status === 'Active' && 
    dayjs().isAfter(dayjs(period.periodDateFrom)) && 
    dayjs().isBefore(dayjs(period.periodDateTo));

  return (
    <Card sx={{ 
      maxWidth: 400, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: 4
      }
    }}>
      {period.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={period.imageUrl}
          alt={period.periodName}
          sx={{ objectFit: 'cover' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
          {period.periodName}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip
            label={getStatusText(period.status)}
            color={getStatusColor(period.status)}
            size="small"
            sx={{ mb: 1 }}
          />
          {isActive && (
            <Chip
              label="Đang diễn ra"
              color="success"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" alignItems="center" mb={1}>
            <LocationOn sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {period.location}
            </Typography>
          </Box>
          
          <Box display="flex" alignItems="center" mb={1}>
            <CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {formatDate(period.periodDateFrom)} - {formatDate(period.periodDateTo)}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Box display="flex" alignItems="center">
              <People sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Tiến độ hiến máu
              </Typography>
            </Box>
            <Typography variant="body2" fontWeight="bold">
              {period.currentQuantity || 0}/{period.targetQuantity}
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={calculateProgress()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {Math.round(calculateProgress())}% hoàn thành
          </Typography>
        </Box>

        {isActive && onRegister && (
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onRegister(period)}
            sx={{ mt: 'auto' }}
          >
            Đăng ký hiến máu
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default BloodDonationPeriodCard; 
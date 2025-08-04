import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle,
  Schedule,
  LocationOn,
  Phone,
  Email,
  Home,
  Bloodtype,
  Warning,
} from '@mui/icons-material';

const UrgentDonationSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [donationInfo, setDonationInfo] = useState(null);

  useEffect(() => {
    // Lấy thông tin từ state navigation
    if (location.state) {
      setDonationInfo(location.state);
    }
  }, [location.state]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewHistory = () => {
    navigate('/history');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%)',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header Success */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h3" component="h1" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
            🎉 Đăng Ký Thành Công!
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            Cảm ơn bạn đã sẵn sàng hiến máu cứu người!
          </Typography>
          <Chip 
            label="Hiến Máu Khẩn Cấp" 
            color="error" 
            icon={<Warning />}
            sx={{ fontSize: '1rem', py: 1 }}
          />
        </Box>

        {/* Thông tin đăng ký */}
        <Card sx={{ mb: 4, border: '2px solid #4caf50' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              📋 Thông Tin Đăng Ký
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Bloodtype sx={{ mr: 1, color: '#d32f2f' }} />
                  <Typography variant="body1">
                    <strong>Mã đăng ký:</strong> #{donationInfo?.donationId || 'N/A'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Warning sx={{ mr: 1, color: '#d32f2f' }} />
                  <Typography variant="body1">
                    <strong>Yêu cầu khẩn cấp:</strong> #{donationInfo?.urgentRequestId || 'N/A'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Trạng thái:</strong> 
                    <Chip 
                      label="Chờ xác nhận" 
                      color="warning" 
                      size="small" 
                      sx={{ ml: 1 }}
                    />
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                ✅ Đăng ký hiến máu khẩn cấp đã được ghi nhận!
              </Typography>
              <Typography variant="body2">
                Nhân viên y tế sẽ liên hệ với bạn trong thời gian sớm nhất để xác nhận lịch hiến máu.
              </Typography>
            </Alert>
          </CardContent>
        </Card>

        {/* Hướng dẫn tiếp theo */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              📞 Các Bước Tiếp Theo
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Nhân viên y tế sẽ gọi điện xác nhận"
                  secondary="Trong vòng 2-4 giờ tới"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Kiểm tra sức khỏe trước khi hiến"
                  secondary="Đảm bảo đủ điều kiện hiến máu"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Đến bệnh viện đúng giờ hẹn"
                  secondary="Mang theo CCCD và các giấy tờ cần thiết"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckCircle sx={{ color: '#4caf50' }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Thực hiện hiến máu"
                  secondary="Quá trình hiến máu mất khoảng 30-45 phút"
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>

        {/* Thông tin liên hệ */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              📞 Thông Tin Liên Hệ
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Phone sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Hotline:</strong> 02839575334
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Email sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Email:</strong> tinbusiness.work@gmail.com
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Địa chỉ:</strong> 118 Đ. Hồng Bàng, Phường 12, Quận 5, TP.HCM
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Schedule sx={{ mr: 1, color: '#1976d2' }} />
                  <Typography variant="body1">
                    <strong>Giờ làm việc:</strong> 7:00 - 18:00 (Thứ 2 - Chủ nhật)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Lưu ý quan trọng */}
        <Card sx={{ mb: 4, border: '2px solid #ff9800' }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ color: '#e65100', fontWeight: 'bold' }}>
              ⚠️ Lưu Ý Quan Trọng
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Ăn nhẹ</strong> trước khi hiến máu (không ăn quá no)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Uống đủ nước</strong> (2-3 lít nước/ngày)
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Ngủ đủ giấc</strong> (7-8 tiếng/đêm)
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Không uống rượu bia</strong> 24h trước khi hiến
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Mang theo CCCD</strong> và các giấy tờ cần thiết
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  • <strong>Liên hệ ngay</strong> nếu có thay đổi lịch hẹn
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGoHome}
            startIcon={<Home />}
            sx={{ 
              bgcolor: '#4caf50',
              '&:hover': { bgcolor: '#2e7d32' },
              minWidth: 200
            }}
          >
            Về Trang Chủ
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            onClick={handleViewHistory}
            startIcon={<Schedule />}
            sx={{ 
              borderColor: '#1976d2',
              color: '#1976d2',
              '&:hover': { 
                borderColor: '#1565c0',
                bgcolor: 'rgba(25, 118, 210, 0.04)'
              },
              minWidth: 200
            }}
          >
            Xem Lịch Sử
          </Button>
        </Box>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Cảm ơn bạn đã tham gia hiến máu cứu người! 🩸
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Mỗi giọt máu của bạn có thể cứu sống một mạng người.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default UrgentDonationSuccess; 
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Alert, CircularProgress,
  TextField, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent
} from '@mui/material';
import { CheckCircle as CheckIcon, Warning as WarningIcon } from '@mui/icons-material';
import axios from 'axios';

const UrgentBooking = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  const [error, setError] = useState(null);
  
  const token = searchParams.get('token');
  const memberId = searchParams.get('memberId');
  const urgentRequestId = searchParams.get('urgentRequestId');

  // Chuyển memberId sang kiểu số để tránh gửi chuỗi hoặc giá trị không hợp lệ
  const numericMemberId = Number(memberId);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

  useEffect(() => {
    if (!token || !memberId || isNaN(numericMemberId) || numericMemberId <= 0) {
      setError('Link xác nhận không hợp lệ. Thiếu thông tin token hoặc memberId.');
      setLoading(false);
      return;
    }

    // Lấy thông tin member thực từ API
    const fetchMemberInfo = async () => {
      try {
        // Sử dụng endpoint mới để lấy thông tin đầy đủ
        const userRes = await axios.get(`${API_URL}/User/${memberId}/urgent-booking-info`);
        
        setMemberInfo({
          memberId: memberId,
          fullName: userRes.data.fullName,
          bloodType: userRes.data.bloodTypeName,
          phone: userRes.data.phoneNumber,
          email: userRes.data.email
        });
      } catch (err) {
        console.error('Lỗi khi lấy thông tin member:', err);
        setError('Không thể tải thông tin người hiến máu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberInfo();
  }, [token, memberId]);

  const handleConfirmBooking = async () => {
    setSubmitting(true);
    try {
      // Gọi API để tạo lịch hiến máu khẩn cấp
      // Chỉ gửi các trường hợp lệ theo UrgentBookingDTO
      const bookingData = {
        memberId: numericMemberId,
        notes: "Hiến máu khẩn cấp - Yêu cầu từ email",
        token: token
      };

      console.log('🔍 Debug: Gửi booking data:', bookingData);
      console.log('🔍 Debug: API URL:', `${API_URL}/DonationRequest/urgent-booking`);

      const response = await axios.post(`${API_URL}/DonationRequest/urgent-booking`, bookingData);
      
      console.log('🔍 Debug: Response status:', response.status);
      console.log('🔍 Debug: Response data:', response.data);
      
      if (response.status === 200) {
        // Chuyển hướng đến trang thành công
        navigate('/urgent-booking-success');
      } else {
        setError('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('❌ Debug: Lỗi khi đặt lịch hiến máu khẩn cấp:', err);
      console.error('❌ Debug: Error response:', err.response);
      console.error('❌ Debug: Error message:', err.message);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.status === 404) {
        setError('API endpoint không tồn tại. Vui lòng kiểm tra backend.');
      } else if (err.response?.status === 500) {
        setError('Lỗi server. Vui lòng thử lại sau.');
      } else {
        setError('Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#d32f2f', textAlign: 'center' }}>
        🚨 Đặt Lịch Hiến Máu Khẩn Cấp
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Cảm ơn bạn đã phản hồi yêu cầu máu khẩn cấp!</strong><br />
          Vui lòng xác nhận thông tin hiến máu.
        </Typography>
      </Alert>

      {memberInfo && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
              Thông tin người hiến máu
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Họ tên:</strong> {memberInfo.fullName}</Typography>
                <Typography><strong>Nhóm máu:</strong> {memberInfo.bloodType}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography><strong>Số điện thoại:</strong> {memberInfo.phone}</Typography>
                <Typography><strong>Email:</strong> {memberInfo.email}</Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f' }}>
          Thông tin hiến máu khẩn cấp
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học<br />
            <strong>Địa chỉ:</strong> 118 Đ. Hồng Bàng, Phường 12, Quận 5, TP.HCM<br />
            <strong>Thời gian:</strong> Càng sớm càng tốt (trong vòng 24h)
          </Typography>
        </Box>

                 <Alert severity="warning" sx={{ mb: 3 }}>
           <Box>
             <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
               Lưu ý quan trọng:
             </Typography>
             <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
               <li>Vui lòng ăn no trước khi hiến máu</li>
               <li>Mang theo CMND/CCCD</li>
               <li>Không uống rượu bia trong 24h trước khi hiến</li>
               <li>Nghỉ ngơi đầy đủ trước khi hiến máu</li>
             </ul>
           </Box>
         </Alert>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/')}
            disabled={submitting}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            size="large"
            startIcon={submitting ? <CircularProgress size={20} /> : <CheckIcon />}
            onClick={handleConfirmBooking}
            disabled={submitting}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận hiến máu khẩn cấp'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default UrgentBooking; 
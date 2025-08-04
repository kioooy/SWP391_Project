import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Alert, Card, CardContent
} from '@mui/material';
import { CheckCircle as CheckIcon, Info as InfoIcon } from '@mui/icons-material';

const UrgentBookingSuccess = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#2e7d32', textAlign: 'center' }}>
        ✅ Đặt Lịch Hiến Máu Khẩn Cấp Thành Công!
      </Typography>

      <Alert severity="success" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Cảm ơn bạn đã đăng ký hiến máu khẩn cấp!</strong><br />
          Chúng tôi đã ghi nhận yêu cầu của bạn và sẽ liên hệ sớm nhất.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckIcon /> Thông tin đặt lịch
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • <strong>Trạng thái:</strong> Đã xác nhận
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • <strong>Loại hiến máu:</strong> Khẩn cấp
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • <strong>Thời gian:</strong> Trong vòng 24h
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              • <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Những việc cần làm tiếp theo
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Để chuẩn bị cho việc hiến máu:</strong>
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Chuẩn bị giấy tờ:</strong> CMND/CCCD, sổ khám bệnh (nếu có)
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Ăn uống:</strong> Ăn no trước khi hiến máu, uống nhiều nước
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Nghỉ ngơi:</strong> Ngủ đủ giấc, tránh căng thẳng
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Tránh:</strong> Rượu bia, thuốc lá trong 24h trước khi hiến
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Liên hệ:</strong> Gọi 02839575334 nếu có thắc mắc
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Chúng tôi sẽ gọi điện xác nhận lịch hẹn trong thời gian sớm nhất. 
            Vui lòng giữ điện thoại luôn bật để nhận cuộc gọi.
          </Typography>
        </Alert>
      </Paper>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/')}
        >
          Về trang chủ
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => navigate('/appointment-history')}
        >
          Xem lịch hẹn
        </Button>
      </Box>
    </Container>
  );
};

export default UrgentBookingSuccess; 
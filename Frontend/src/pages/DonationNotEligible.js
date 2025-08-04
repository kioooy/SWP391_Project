import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container, Typography, Paper, Box, Button, Alert, Card, CardContent
} from '@mui/material';
import { Warning as WarningIcon, Info as InfoIcon } from '@mui/icons-material';

const DonationNotEligible = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Không đủ điều kiện hiến máu';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: '#d32f2f', textAlign: 'center' }}>
        ⚠️ Không Đủ Điều Kiện Hiến Máu
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body1">
          <strong>Rất tiếc, bạn hiện tại không đủ điều kiện để hiến máu.</strong>
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningIcon /> Lý do không đủ điều kiện
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {reason}
          </Typography>
        </CardContent>
      </Card>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
          Điều kiện hiến máu cơ bản
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Để hiến máu, bạn cần đáp ứng các điều kiện sau:</strong>
          </Typography>
          
          <Box sx={{ pl: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Tuổi:</strong> Từ 18-60 tuổi
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Cân nặng:</strong> Từ 45kg trở lên
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Sức khỏe:</strong> Không mắc các bệnh truyền nhiễm
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Thời gian:</strong> Cách lần hiến trước ít nhất 84 ngày
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Sau truyền máu:</strong> Cách lần truyền máu ít nhất 365 ngày
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              • <strong>Không có lịch hiến:</strong> Không có lịch hiến máu đang chờ xử lý
            </Typography>
          </Box>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Nếu bạn nghĩ rằng đây là lỗi, vui lòng liên hệ với chúng tôi để được hỗ trợ.
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
          onClick={() => navigate('/contact')}
        >
          Liên hệ hỗ trợ
        </Button>
      </Box>
    </Container>
  );
};

export default DonationNotEligible; 
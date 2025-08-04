import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Divider,
  CircularProgress,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import { Bloodtype, Warning, Schedule, LocationOn } from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

const validationSchema = Yup.object({
  preferredDate: Yup.date()
    .min(new Date(), 'Ngày hiến máu phải từ hôm nay trở đi')
    .required('Ngày hiến máu là bắt buộc'),
  preferredTime: Yup.string()
    .required('Thời gian hiến máu là bắt buộc'),
  notes: Yup.string()
    .max(500, 'Ghi chú không được quá 500 ký tự'),
});

const UrgentDonationRegistration = () => {
  const navigate = useNavigate();
  const [urgentRequest, setUrgentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Lấy thông tin từ localStorage
  const urgentRequestId = localStorage.getItem('urgentRequestId');
  const bloodType = localStorage.getItem('bloodType');

  useEffect(() => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để đăng ký hiến máu khẩn cấp');
      setLoading(false);
      return;
    }

    // Kiểm tra thông tin urgent request
    if (!urgentRequestId || !bloodType) {
      setError('Thông tin yêu cầu khẩn cấp không hợp lệ');
      setLoading(false);
      return;
    }

    // Lấy thông tin chi tiết yêu cầu khẩn cấp
    fetchUrgentRequestDetails();
  }, [urgentRequestId]);

  const fetchUrgentRequestDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/UrgentBloodRequest/${urgentRequestId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy thông tin yêu cầu khẩn cấp');
      }

      const data = await response.json();
      setUrgentRequest(data);
    } catch (error) {
      console.error('Lỗi khi lấy thông tin yêu cầu khẩn cấp:', error);
      setError('Không thể lấy thông tin yêu cầu khẩn cấp');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      preferredDate: '',
      preferredTime: '',
      notes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const donationRequest = {
          memberId: user.UserId,
          preferredDonationDate: values.preferredDate,
          preferredTime: values.preferredTime,
          notes: values.notes,
          urgentRequestId: parseInt(urgentRequestId), // Liên kết với yêu cầu khẩn cấp
          isUrgent: true, // Đánh dấu là hiến máu khẩn cấp
        };

        const response = await fetch(`${API_BASE_URL}/DonationRequest`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(donationRequest),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Có lỗi xảy ra khi đăng ký');
        }

        const result = await response.json();
        setSuccess(true);
        setSnackbar({
          open: true,
          message: 'Đăng ký hiến máu khẩn cấp thành công!',
          severity: 'success',
        });

        // Xóa thông tin urgent donation khỏi localStorage
        localStorage.removeItem('urgentRequestId');
        localStorage.removeItem('bloodType');

        // Chuyển đến trang thành công sau 2 giây
        setTimeout(() => {
          navigate('/urgent-donation-success', { 
            state: { 
              donationId: result.donationRequestId,
              urgentRequestId: urgentRequestId 
            } 
          });
        }, 2000);

      } catch (error) {
        console.error('Lỗi khi đăng ký hiến máu:', error);
        setSnackbar({
          open: true,
          message: error.message || 'Có lỗi xảy ra khi đăng ký hiến máu',
          severity: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
  });

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 2
      }}>
        <Alert severity="error" sx={{ maxWidth: 500 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      py: 4,
      px: 2
    }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
            🩸 Đăng Ký Hiến Máu Khẩn Cấp
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Một mạng người đang cần sự giúp đỡ của bạn!
          </Typography>
        </Box>

        {/* Thông tin yêu cầu khẩn cấp */}
        {urgentRequest && (
          <Card sx={{ mb: 4, border: '2px solid #d32f2f' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Warning sx={{ color: '#d32f2f', mr: 1 }} />
                <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold' }}>
                  Thông Tin Yêu Cầu Khẩn Cấp
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Bloodtype sx={{ mr: 1, color: '#d32f2f' }} />
                    <Typography variant="body1">
                      <strong>Nhóm máu cần:</strong> {bloodType}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Bệnh nhân:</strong> {urgentRequest.patientName}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1, color: '#d32f2f' }} />
                    <Typography variant="body1">
                      <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1">
                      <strong>Lý do:</strong> {urgentRequest.reason || 'Khẩn cấp'}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Lưu ý:</strong> Đây là yêu cầu hiến máu khẩn cấp. 
                  Vui lòng chọn thời gian sớm nhất có thể để cứu sống bệnh nhân.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Form đăng ký */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Thông Tin Đăng Ký Hiến Máu
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="preferredDate"
                    name="preferredDate"
                    label="Ngày hiến máu"
                    type="date"
                    value={formik.values.preferredDate}
                    onChange={formik.handleChange}
                    error={formik.touched.preferredDate && Boolean(formik.errors.preferredDate)}
                    helperText={formik.touched.preferredDate && formik.errors.preferredDate}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ min: new Date().toISOString().split('T')[0] }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="preferredTime-label">Thời gian hiến máu</InputLabel>
                    <Select
                      labelId="preferredTime-label"
                      id="preferredTime"
                      name="preferredTime"
                      value={formik.values.preferredTime}
                      onChange={formik.handleChange}
                      error={formik.touched.preferredTime && Boolean(formik.errors.preferredTime)}
                      label="Thời gian hiến máu"
                    >
                      <MenuItem value="08:00">08:00 - 10:00</MenuItem>
                      <MenuItem value="10:00">10:00 - 12:00</MenuItem>
                      <MenuItem value="14:00">14:00 - 16:00</MenuItem>
                      <MenuItem value="16:00">16:00 - 18:00</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="notes"
                    name="notes"
                    label="Ghi chú (tùy chọn)"
                    multiline
                    rows={3}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    error={formik.touched.notes && Boolean(formik.errors.notes)}
                    helperText={formik.touched.notes && formik.errors.notes}
                    placeholder="Ví dụ: Tôi có thể hiến máu ngay lập tức nếu cần..."
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/')}
                  disabled={loading}
                  sx={{ minWidth: 120 }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ 
                    minWidth: 200,
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#b71c1c' }
                  }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Schedule />}
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng Ký Hiến Máu Khẩn Cấp'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Thông tin bổ sung */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32', fontWeight: 'bold' }}>
              📋 Điều Kiện Hiến Máu
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Tuổi từ 18-60 tuổi
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Cân nặng từ 45kg trở lên
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Sức khỏe tốt, không mắc bệnh truyền nhiễm
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Không hiến máu trong 84 ngày gần nhất
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Không uống rượu bia 24h trước khi hiến
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  ✅ Ăn nhẹ trước khi hiến máu
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar thông báo */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MuiAlert 
          elevation={6} 
          variant="filled" 
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default UrgentDonationRegistration; 
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
  componentId: Yup.number()
    .required('Chế phẩm máu là bắt buộc'),
  donationVolume: Yup.number()
    .min(250, 'Lượng máu tối thiểu là 250ml')
    .max(500, 'Lượng máu tối đa là 500ml')
    .required('Lượng máu hiến là bắt buộc'),
  notes: Yup.string()
    .max(500, 'Ghi chú không được quá 500 ký tự'),
  patientCondition: Yup.string()
    .required('Tình trạng bệnh nhân là bắt buộc'),
});

const UrgentDonationRegistration = () => {
  const navigate = useNavigate();
  const [urgentRequest, setUrgentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [bloodComponents, setBloodComponents] = useState([]);

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
    // Lấy danh sách chế phẩm máu
    fetchBloodComponents();
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

  const fetchBloodComponents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/BloodComponent`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể lấy danh sách chế phẩm máu');
      }

      const data = await response.json();
      setBloodComponents(data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách chế phẩm máu:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      componentId: '',
      donationVolume: 350,
      notes: '',
      patientCondition: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        const donationRequest = {
          memberId: user.UserId,
          componentId: parseInt(values.componentId),
          responsibleById: 1, // Default staff ID
          donationVolume: parseInt(values.donationVolume),
          notes: values.notes,
          patientCondition: values.patientCondition,
          urgentRequestId: parseInt(urgentRequestId), // Liên kết với yêu cầu khẩn cấp
        };

        const response = await fetch(`${API_BASE_URL}/DonationRequest/register-urgent`, {
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
              donationId: result.donationId,
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
                  Staff sẽ liên hệ với bạn ngay để sắp xếp thời gian hiến máu phù hợp.
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
                  <FormControl fullWidth>
                    <InputLabel id="componentId-label">Chế phẩm máu</InputLabel>
                    <Select
                      labelId="componentId-label"
                      id="componentId"
                      name="componentId"
                      value={formik.values.componentId}
                      onChange={formik.handleChange}
                      error={formik.touched.componentId && Boolean(formik.errors.componentId)}
                      label="Chế phẩm máu"
                    >
                      {bloodComponents.map((component) => (
                        <MenuItem key={component.componentId} value={component.componentId}>
                          {component.componentName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    id="donationVolume"
                    name="donationVolume"
                    label="Lượng máu hiến (ml)"
                    type="number"
                    value={formik.values.donationVolume}
                    onChange={formik.handleChange}
                    error={formik.touched.donationVolume && Boolean(formik.errors.donationVolume)}
                    helperText={formik.touched.donationVolume && formik.errors.donationVolume}
                    inputProps={{ min: 250, max: 500 }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="patientCondition"
                    name="patientCondition"
                    label="Tình trạng bệnh nhân"
                    value={formik.values.patientCondition}
                    onChange={formik.handleChange}
                    error={formik.touched.patientCondition && Boolean(formik.errors.patientCondition)}
                    helperText={formik.touched.patientCondition && formik.errors.patientCondition}
                    placeholder="Ví dụ: Cần máu gấp cho ca phẫu thuật khẩn cấp..."
                  />
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
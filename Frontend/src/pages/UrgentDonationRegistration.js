import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
import RegistrationStatusCheck from '../components/RegistrationStatusCheck';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

const validationSchema = Yup.object({
  donationVolume: Yup.number()
    .min(250, 'Lượng máu tối thiểu là 250ml')
    .max(500, 'Lượng máu tối đa là 500ml')
    .required('Lượng máu hiến là bắt buộc'),
  customNotes: Yup.string()
    .max(500, 'Ghi chú không được quá 500 ký tự'),
});

const UrgentDonationRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [urgentRequest, setUrgentRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [registrationStatus, setRegistrationStatus] = useState(null);

  // Hàm lấy thông tin từ URL parameters
  const getUrlParams = () => {
    const urlParams = new URLSearchParams(location.search);
    return {
      urgentRequestId: urlParams.get('urgentRequestId'),
      bloodType: urlParams.get('bloodType')
    };
  };

  // Hàm lấy thông tin từ localStorage
  const getLocalStorageData = () => {
    return {
      urgentRequestId: localStorage.getItem('urgentRequestId'),
      bloodType: localStorage.getItem('bloodType')
    };
  };

  // Hàm lưu thông tin vào localStorage
  const saveToLocalStorage = (urgentRequestId, bloodType) => {
    if (urgentRequestId) localStorage.setItem('urgentRequestId', urgentRequestId);
    if (bloodType) localStorage.setItem('bloodType', bloodType);
  };

  useEffect(() => {
    // Kiểm tra đăng nhập
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Bạn cần đăng nhập để đăng ký hiến máu khẩn cấp');
      setLoading(false);
      return;
    }

    // Lấy thông tin từ URL parameters trước, sau đó từ localStorage
    const urlParams = getUrlParams();
    const localStorageData = getLocalStorageData();
    
    let urgentRequestId = urlParams.urgentRequestId || localStorageData.urgentRequestId;
    let bloodType = urlParams.bloodType || localStorageData.bloodType;

    // Nếu có thông tin từ URL, lưu vào localStorage
    if (urlParams.urgentRequestId || urlParams.bloodType) {
      saveToLocalStorage(urlParams.urgentRequestId, urlParams.bloodType);
    }

    // Kiểm tra thông tin urgent request
    if (!urgentRequestId || !bloodType) {
      setError('Thông tin yêu cầu khẩn cấp không hợp lệ');
      setLoading(false);
      return;
    }

    // Lấy thông tin chi tiết yêu cầu khẩn cấp
    fetchUrgentRequestDetails(urgentRequestId);
  }, []);

  const fetchUrgentRequestDetails = async (urgentRequestId) => {
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
      donationVolume: 350,
      notes: '',
      notesOption: '',
      customNotes: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Kiểm tra trạng thái đăng ký trước khi submit
        if (registrationStatus && !registrationStatus.canRegister) {
          setSnackbar({ 
            open: true, 
            message: registrationStatus.message, 
            severity: 'error' 
          });
          return;
        }

        setLoading(true);
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        console.log('🔍 [DEBUG] Form values:', values);
        console.log('🔍 [DEBUG] User from localStorage:', user);
        console.log('🔍 [DEBUG] Token:', token);
        // Lấy thông tin urgent request từ localStorage
        const currentUrgentRequestId = localStorage.getItem('urgentRequestId');
        console.log('🔍 [DEBUG] UrgentRequestId:', currentUrgentRequestId);

        const componentId = 1; // ComponentId, cần lấy từ loại máu thực tế
        // Xử lý ghi chú dựa trên option được chọn
        let finalNotes = '';
        if (values.notesOption === 'custom') {
          finalNotes = values.customNotes;
        } else if (values.notesOption) {
          finalNotes = values.notesOption;
        }

        const donationRequest = {
          memberId: user.UserId,
          componentId: Number(componentId),
          donationVolume: parseInt(values.donationVolume),
          notes: finalNotes,
          patientCondition: null, // Không có thông tin bệnh nhân trong form đăng ký khẩn cấp
          urgentRequestId: currentUrgentRequestId ? parseInt(currentUrgentRequestId) : null, // Liên kết với yêu cầu khẩn cấp
        };

        console.log('🔍 [DEBUG] Request payload:', donationRequest);
        console.log('🔍 [DEBUG] API URL:', `${API_BASE_URL}/DonationRequest/register-urgent`);

        const response = await fetch(`${API_BASE_URL}/DonationRequest/register-urgent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(donationRequest),
        });

        console.log('🔍 [DEBUG] Response status:', response.status);
        console.log('🔍 [DEBUG] Response headers:', response.headers);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ [DEBUG] Error response:', errorData);
          console.error('❌ [DEBUG] Validation errors:', errorData.errors);
          throw new Error(errorData.message || 'Có lỗi xảy ra khi đăng ký');
        }

        const result = await response.json();
        console.log('✅ [DEBUG] Success response:', result);
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
              urgentRequestId: currentUrgentRequestId 
            } 
          });
        }, 2000);

      } catch (error) {
        console.error('❌ [DEBUG] Lỗi khi đăng ký hiến máu:', error);
        console.error('❌ [DEBUG] Error stack:', error.stack);
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
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Thử lại
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

        {/* Kiểm tra trạng thái đăng ký */}
        <RegistrationStatusCheck onStatusChange={setRegistrationStatus} />

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
                       <strong>Nhóm máu cần:</strong> {localStorage.getItem('bloodType') || 'Không xác định'}
                     </Typography>
                   </Box>
                 </Grid>
                 <Grid item xs={12} md={6}>
                   <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                     <LocationOn sx={{ mr: 1, color: '#d32f2f' }} />
                     <Typography variant="body1">
                       <strong>Địa điểm:</strong> Bệnh viện Truyền máu Huyết học (118 Đ. Hồng Bàng, Phường 12, Quận 5, Hồ Chí Minh)
                     </Typography>
                   </Box>
                 </Grid>
               </Grid>

              <Divider sx={{ my: 2 }} />
              
                             <Alert severity="warning" sx={{ mb: 2 }}>
                 <Typography variant="body2">
                   <strong>Lưu ý:</strong> Đây là yêu cầu hiến máu khẩn cấp.
                 </Typography>
               </Alert>
               
               <Alert severity="info" sx={{ mb: 2 }}>
                 <Typography variant="body2">
                   <strong>💡 Gợi ý:</strong> Vui lòng chọn khả năng hiến máu phù hợp để staff có thể 
                   ưu tiên và liên hệ với bạn kịp thời.
                 </Typography>
               </Alert>
            </CardContent>
          </Card>
        )}

        {/* Form đăng ký */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold' }}>
              Thông Tin Đăng Ký Hiến Máu Khẩn Cấp
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel id="donationVolume-label">Lượng máu hiến</InputLabel>
                    <Select
                      labelId="donationVolume-label"
                      id="donationVolume"
                      name="donationVolume"
                      value={formik.values.donationVolume}
                      onChange={formik.handleChange}
                      error={formik.touched.donationVolume && Boolean(formik.errors.donationVolume)}
                      label="Lượng máu hiến"
                    >
                      <MenuItem value={250}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>250 ml</span>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            (Cho người ≤ 50kg)
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={350}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>350 ml</span>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            (Cho người 51-60kg)
                          </Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value={450}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                          <span>450 ml</span>
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                            (Cho người {'>'} 60kg)
                          </Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                    {formik.touched.donationVolume && formik.errors.donationVolume && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                        {formik.errors.donationVolume}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                                 <Grid item xs={12}>
                   <FormControl fullWidth>
                     <InputLabel id="notesOption-label">Khả năng hiến máu khẩn cấp</InputLabel>
                     <Select
                       labelId="notesOption-label"
                       id="notesOption"
                       name="notesOption"
                       value={formik.values.notesOption}
                       onChange={formik.handleChange}
                       label="Khả năng hiến máu khẩn cấp"
                     >
                       <MenuItem value="">
                         <em>Chọn khả năng phù hợp</em>
                       </MenuItem>
                       <MenuItem value="Có thể hiến máu ngay lập tức">
                         Có thể hiến máu ngay lập tức
                       </MenuItem>
                       <MenuItem value="Có thể hiến trong vòng 30 phút">
                         Có thể hiến trong vòng 30 phút
                       </MenuItem>
                       <MenuItem value="Có thể hiến trong vòng 1 giờ">
                         Có thể hiến trong vòng 1 giờ
                       </MenuItem>
                       <MenuItem value="Cần thời gian sắp xếp trước khi hiến">
                         Cần thời gian sắp xếp trước khi hiến
                       </MenuItem>
                       <MenuItem value="custom">
                         Khác
                       </MenuItem>
                     </Select>
                   </FormControl>
                 </Grid>

                {formik.values.notesOption === 'custom' && (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      id="customNotes"
                      name="customNotes"
                      label="Ghi chú tùy chỉnh"
                      multiline
                      rows={3}
                      value={formik.values.customNotes}
                      onChange={formik.handleChange}
                      placeholder="Vui lòng ghi thời gian hoặc thông tin khác mà bạn muốn chia sẻ..."
                    />
                  </Grid>
                )}
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
                  disabled={loading || (registrationStatus && !registrationStatus.canRegister)}
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
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import dayjs from 'dayjs';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const validationSchema = Yup.object({
  periodName: Yup.string()
    .required('Tên đợt hiến máu là bắt buộc')
    .max(100, 'Tên đợt không được quá 100 ký tự'),
  status: Yup.string()
    .required('Trạng thái là bắt buộc')
    .oneOf(['Active', 'Completed', 'Cancelled'], 'Trạng thái không hợp lệ'),
  periodDateFrom: Yup.date()
    .required('Thời gian bắt đầu là bắt buộc')
    .min(new Date(), 'Thời gian bắt đầu phải lớn hơn thời gian hiện tại'),
  periodDateTo: Yup.date()
    .required('Thời gian kết thúc là bắt buộc')
    .min(Yup.ref('periodDateFrom'), 'Thời gian kết thúc phải sau thời gian bắt đầu'),
  targetQuantity: Yup.number()
    .required('Số lượng mục tiêu là bắt buộc')
    .positive('Số lượng mục tiêu phải là số dương')
    .integer('Số lượng mục tiêu phải là số nguyên'),
});

const CreateBloodDonationPeriod = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hospital, setHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [isNameEdited, setIsNameEdited] = useState(false); // Theo dõi user có sửa tên không

  const initialValues = {
    periodName: '',
    status: 'Active',
    periodDateFrom: dayjs(),
    periodDateTo: dayjs().add(1, 'day'),
    targetQuantity: 100
  };

  // Lấy thông tin bệnh viện khi component mount
  useEffect(() => {
    if (open) {
      fetchHospital();
    }
  }, [open]);

  const fetchHospital = async () => {
    try {
      setHospitalLoading(true);
      const response = await axios.get('/api/Hospital');
      setHospital(response.data);
    } catch (error) {
      console.error('Error fetching hospital:', error);
      setError('Không thể tải thông tin bệnh viện');
    } finally {
      setHospitalLoading(false);
    }
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      if (!hospital) {
        throw new Error('Không có thông tin bệnh viện');
      }

      const requestData = {
        periodName: values.periodName,
        location: `${hospital.name} - ${hospital.address}`,
        status: values.status,
        periodDateFrom: values.periodDateFrom.toDate(),
        periodDateTo: values.periodDateTo.toDate(),
        targetQuantity: values.targetQuantity
      };

      await axios.post('/api/BloodDonationPeriod', requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      onSuccess({ message: 'Tạo đợt hiến máu thành công!', severity: 'success' });
      onClose();
    } catch (error) {
      console.error('Error creating blood donation period:', error);
      
      // Log chi tiết lỗi từ backend để chẩn đoán
      if (error.response) {
        console.error('Backend Response Data:', error.response.data);
        console.error('Backend Response Status:', error.response.status);

        // Hiển thị lỗi validation cụ thể nếu có
        if (error.response.data && error.response.data.errors) {
            const errorDetails = Object.entries(error.response.data.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('; ');
            onSuccess({ message: `Lỗi dữ liệu: ${errorDetails}. Vui lòng kiểm tra lại thông tin.`, severity: 'error' });
            onClose();
            return; // Dừng lại sau khi hiển thị lỗi validation
        }
      }

      if (error.response?.status === 403) {
        onSuccess({ message: 'Bạn không có quyền thực hiện hành động này. Vui lòng đăng nhập với tài khoản Staff hoặc Admin.', severity: 'error' });
        onClose();
      } else if (error.response?.data?.message) {
        onSuccess({ message: error.response.data.message, severity: 'error' });
        onClose();
      } else if (error.message) {
        onSuccess({ message: error.message, severity: 'error' });
        onClose();
      } else {
        onSuccess({ message: 'Có lỗi xảy ra khi tạo đợt hiến máu. Vui lòng thử lại.', severity: 'error' });
        onClose();
      }
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h5" component="h2">
          Tạo Đợt Hiến Máu Mới
        </Typography>
      </DialogTitle>
      <DialogContent>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, setFieldValue, isSubmitting }) => (
              <Form>
                <Box sx={{ mt: 2 }}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {error}
                    </Alert>
                  )}

                  {/* Hiển thị thông tin bệnh viện */}
                  {/* ĐÃ XÓA: Alert hiển thị địa điểm hiến máu và các thông tin bệnh viện */}

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="periodName"
                        label="Tên đợt hiến máu"
                        value={values.periodName}
                        onChange={e => {
                          handleChange(e);
                          setIsNameEdited(true);
                        }}
                        error={touched.periodName && Boolean(errors.periodName)}
                        helperText={touched.periodName && errors.periodName}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Trạng thái</InputLabel>
                        <Select
                          name="status"
                          value={values.status}
                          onChange={handleChange}
                          error={touched.status && Boolean(errors.status)}
                        >
                          <MenuItem value="Active">Hoạt động</MenuItem>
                          <MenuItem value="Completed">Hoàn thành</MenuItem>
                          <MenuItem value="Cancelled">Đã hủy</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="targetQuantity"
                        label="Số lượng mục tiêu"
                        type="number"
                        value={values.targetQuantity}
                        onChange={handleChange}
                        error={touched.targetQuantity && Boolean(errors.targetQuantity)}
                        helperText={touched.targetQuantity && errors.targetQuantity}
                        required
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Thời gian bắt đầu"
                        value={values.periodDateFrom}
                        onChange={(newValue) => {
                          setFieldValue('periodDateFrom', newValue);
                          // Nếu user chưa sửa tên thì tự động set tên theo ngày
                          if (!isNameEdited && newValue) {
                            const dateStr = dayjs(newValue).format('DD/MM/YYYY');
                            setFieldValue('periodName', `Hiến Máu Nhân Đạo Ngày (${dateStr})`);
                          }
                          // Nếu ngày kết thúc khác ngày bắt đầu thì set lại về cuối ngày bắt đầu
                          if (values.periodDateTo && !dayjs(newValue).isSame(values.periodDateTo, 'day')) {
                            setFieldValue('periodDateTo', dayjs(newValue).endOf('day'));
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={touched.periodDateFrom && Boolean(errors.periodDateFrom)}
                            helperText={touched.periodDateFrom && errors.periodDateFrom}
                            required
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <DateTimePicker
                        label="Thời gian kết thúc"
                        value={values.periodDateTo}
                        onChange={(newValue) => {
                          // Chỉ cho phép chọn trong cùng ngày với ngày bắt đầu
                          if (newValue && dayjs(newValue).isSame(values.periodDateFrom, 'day')) {
                            setFieldValue('periodDateTo', newValue);
                          } else if (values.periodDateFrom) {
                            setFieldValue('periodDateTo', dayjs(values.periodDateFrom).endOf('day'));
                          }
                        }}
                        minDateTime={dayjs(values.periodDateFrom).startOf('day')}
                        maxDateTime={dayjs(values.periodDateFrom).endOf('day')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={touched.periodDateTo && Boolean(errors.periodDateTo)}
                            helperText={touched.periodDateTo && errors.periodDateTo}
                            required
                          />
                        )}
                      />
                    </Grid>

                  </Grid>
                </Box>
              </Form>
            )}
          </Formik>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading || hospitalLoading || !hospital}
          onClick={() => {
            const form = document.querySelector('form');
            if (form) {
              form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
            }
          }}
        >
          {loading ? <CircularProgress size={24} /> : 'Tạo đợt hiến máu'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateBloodDonationPeriod; 
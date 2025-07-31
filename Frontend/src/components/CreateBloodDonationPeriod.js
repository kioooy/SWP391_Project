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
import { DateTimePicker, TimePicker, DatePicker } from '@mui/x-date-pickers';
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
  date: Yup.date().required('Ngày là bắt buộc'),
  periodDateFrom: Yup.date().required('Giờ bắt đầu là bắt buộc'),
  periodDateTo: Yup.date().required('Giờ kết thúc là bắt buộc'),
  targetQuantity: Yup.number()
    .required('Số lượng mục tiêu là bắt buộc')
    .positive('Số lượng mục tiêu phải là số dương')
    .integer('Số lượng mục tiêu phải là số nguyên'),
}).test('time-validation', 'Thời gian không hợp lệ', function(value) {
  const { periodDateFrom, periodDateTo } = value;
  
  if (!periodDateFrom || !periodDateTo) {
    return true; // Bỏ qua nếu chưa có đủ dữ liệu
  }

  // Chuyển đổi sang dayjs object nếu cần
  const fromDate = dayjs.isDayjs(periodDateFrom) ? periodDateFrom : dayjs(periodDateFrom);
  const toDate = dayjs.isDayjs(periodDateTo) ? periodDateTo : dayjs(periodDateTo);

  // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
  if (fromDate.isAfter(toDate)) {
    return this.createError({
      message: 'Thời gian bắt đầu phải trước thời gian kết thúc'
    });
  }

  // Kiểm tra khoảng thời gian tối thiểu (ít nhất 1 giờ)
  const duration = toDate.diff(fromDate, 'hour', true);
  if (duration < 1) {
    return this.createError({
      message: 'Khoảng thời gian phải ít nhất 1 giờ'
    });
  }

  // Kiểm tra thời gian bắt đầu không được trong quá khứ
  const now = dayjs();
  if (fromDate.isBefore(now, 'day')) {
    return this.createError({
      message: 'Không thể tạo đợt hiến máu trong quá khứ'
    });
  }

  return true;
});

const CreateBloodDonationPeriod = ({ open, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hospital, setHospital] = useState(null);
  const [hospitalLoading, setHospitalLoading] = useState(true);
  const [isNameEdited, setIsNameEdited] = useState(false); // Theo dõi user có sửa tên không

  const initialValues = {
    periodName: '',
    date: dayjs(), // Thêm trường ngày
    periodDateFrom: dayjs().hour(8).minute(0), // Mặc định 8:00 sáng
    periodDateTo: dayjs().hour(17).minute(0), // Mặc định 17:00
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

      // Kiểm tra validation thời gian
      if (values.periodDateFrom && values.periodDateTo) {
        // Đảm bảo là dayjs object
        const fromDate = dayjs.isDayjs(values.periodDateFrom) ? values.periodDateFrom : dayjs(values.periodDateFrom);
        const toDate = dayjs.isDayjs(values.periodDateTo) ? values.periodDateTo : dayjs(values.periodDateTo);
        
        // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
        if (fromDate.isAfter(toDate)) {
          throw new Error('Thời gian bắt đầu phải trước thời gian kết thúc');
        }

        // Kiểm tra khoảng thời gian tối thiểu (ít nhất 1 giờ)
        const duration = toDate.diff(fromDate, 'hour', true);
        if (duration < 1) {
          throw new Error('Khoảng thời gian phải ít nhất 1 giờ');
        }

        // Kiểm tra thời gian bắt đầu không được trong quá khứ
        const now = dayjs();
        if (fromDate.isBefore(now, 'day')) {
          throw new Error('Không thể tạo đợt hiến máu trong quá khứ');
        }
      }

      let periodName = values.periodName;
      if (!periodName) {
        const dateStr = dayjs(values.date).format('DD/MM/YYYY');
        periodName = `Hiến Máu Nhân Đạo Ngày (${dateStr})`;
      }

      // Đảm bảo thời gian được gửi đúng múi giờ local
      const requestData = {
        periodName,
        location: `${hospital.name} - ${hospital.address}`,
        status: 'Active', // luôn gửi status là Active
        periodDateFrom: values.periodDateFrom.format('YYYY-MM-DDTHH:mm'),
        periodDateTo: values.periodDateTo.format('YYYY-MM-DDTHH:mm'),
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
                  
                  {/* Hiển thị lỗi validation tổng thể */}
                  {errors.timeValidation && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {errors.timeValidation}
                    </Alert>
                  )}

                  {/* Hiển thị thông tin bệnh viện */}
                  {/* ĐÃ XÓA: Alert hiển thị địa điểm hiến máu và các thông tin bệnh viện */}

                  <Grid container spacing={3}>
                    {/* Ẩn trường nhập tên đợt hiến máu */}
                    {/* <Grid item xs={12}>
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
                    </Grid> */}
                    {/* Thêm trường chọn ngày */}
                    <Grid item xs={12} sm={6}>
                      <DatePicker
                        label="Ngày tổ chức"
                        value={values.date}
                        onChange={newDate => {
                          setFieldValue('date', newDate);
                          // Khi đổi ngày, cập nhật lại ngày cho periodDateFrom và periodDateTo, giữ nguyên giờ/phút
                          if (newDate) {
                            const currentFromHour = values.periodDateFrom ? values.periodDateFrom.hour() : 8;
                            const currentFromMinute = values.periodDateFrom ? values.periodDateFrom.minute() : 0;
                            const currentToHour = values.periodDateTo ? values.periodDateTo.hour() : 17;
                            const currentToMinute = values.periodDateTo ? values.periodDateTo.minute() : 0;
                            
                            setFieldValue('periodDateFrom', newDate.hour(currentFromHour).minute(currentFromMinute));
                            setFieldValue('periodDateTo', newDate.hour(currentToHour).minute(currentToMinute));
                          }
                          // Nếu user chưa sửa tên thì tự động cập nhật tên đợt
                          if (!isNameEdited && newDate) {
                            const dateStr = newDate.format('DD/MM/YYYY');
                            setFieldValue('periodName', `Hiến Máu Nhân Đạo Ngày (${dateStr})`);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            error={touched.date && Boolean(errors.date)}
                            helperText={touched.date && errors.date}
                            required
                          />
                        )}
                      />
                    </Grid>
                    {/* Chọn giờ bắt đầu */}
                    <Grid item xs={12} sm={3}>
                      <TimePicker
                        label="Giờ bắt đầu"
                        value={values.periodDateFrom}
                        onChange={newTime => {
                          // Kết hợp ngày đã chọn với giờ mới
                          if (newTime && values.date) {
                            setFieldValue('periodDateFrom', values.date.hour(newTime.hour()).minute(newTime.minute()));
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
                    {/* Chọn giờ kết thúc */}
                    <Grid item xs={12} sm={3}>
                      <TimePicker
                        label="Giờ kết thúc"
                        value={values.periodDateTo}
                        onChange={newTime => {
                          if (newTime && values.date) {
                            setFieldValue('periodDateTo', values.date.hour(newTime.hour()).minute(newTime.minute()));
                          }
                        }}
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
                    <Grid item xs={12}>
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
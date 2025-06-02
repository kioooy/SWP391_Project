import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Alert,
  Grid,
  MenuItem,
  Paper,
  Avatar,
  Card,
  CardContent,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Chip,
  Container,
} from '@mui/material';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../features/auth/authSlice';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PersonIcon from '@mui/icons-material/Person';
import InfoIcon from '@mui/icons-material/Info';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import dayjs from 'dayjs';

const steps = ['Tải lên giấy tờ', 'Nhập thông tin', 'Hồ sơ hiến máu', 'Xác thực tài khoản'];

const idTypes = [
  'Chứng minh nhân dân',
  'Căn cước công dân',
  'Hộ chiếu',
];

const cities = [
  'Hồ Chí Minh',
  'Hà Nội',
  'Đà Nẵng',
  'Cần Thơ',
  'Hải Phòng',
];

const districts = {
  'Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Thủ Đức'],
  'Hà Nội': ['Hoàn Kiếm', 'Ba Đình', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Cầu Giấy', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Tây Hồ', 'Long Biên', 'Hà Đông'],
  'Đà Nẵng': ['Hải Châu', 'Cẩm Lệ', 'Ngũ Hành Sơn', 'Sơn Trà', 'Liên Chiểu', 'Thanh Khê'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt'],
  'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn'],
};

const wards = {
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
  'Quận 2': ['Phường An Phú', 'Phường An Khánh', 'Phường Bình An', 'Phường Bình Khánh', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Thảo Điền', 'Phường Thạnh Mỹ Lợi', 'Phường Thu Thiêm'],
  'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
  'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'],
  'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
  'Hoàn Kiếm': ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Đồng Xuân', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Buồm', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo'],
  'Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'],
  'Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước'],
};

const occupations = [
  'Học sinh/Sinh viên',
  'Giáo viên',
  'Bác sĩ',
  'Y tá/Điều dưỡng',
  'Kỹ sư',
  'Công nhân',
  'Nông dân',
  'Kinh doanh',
  'Công chức/Viên chức',
  'Lao động tự do',
  'Nghỉ hưu',
  'Khác',
];

const getValidationSchema = (activeStep) => {
  const baseSchema = {
    idType: Yup.string().required('Vui lòng chọn loại giấy tờ'),
    personalId: Yup.string()
      .matches(/^[0-9]{9,12}$/, 'Số CMND phải có 9-12 chữ số')
      .required('Vui lòng nhập số CMND'),
    fullName: Yup.string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .required('Vui lòng nhập họ và tên'),
    dateOfBirth: Yup.date()
      .max(new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại')
      .required('Vui lòng chọn ngày sinh'),
    gender: Yup.string().required('Vui lòng chọn giới tính'),
    city: Yup.string().required('Vui lòng chọn tỉnh/thành phố'),
    district: Yup.string().required('Vui lòng chọn quận/huyện'),
    ward: Yup.string().required('Vui lòng chọn phường/xã'),
    street: Yup.string().required('Vui lòng nhập số nhà, tên đường'),
  };

  if (activeStep >= 2) {
    baseSchema.mobilePhone = Yup.string()
      .matches(/^[0-9]{10}$/, 'Số điện thoại di động phải có 10 chữ số')
      .required('Vui lòng nhập số điện thoại di động');
    baseSchema.email = Yup.string()
      .email('Email không đúng định dạng')
      .required('Vui lòng nhập email');
    baseSchema.occupation = Yup.string().required('Vui lòng chọn nghề nghiệp');
    baseSchema.landlinePhone = Yup.string()
      .matches(/^[0-9]{11}$/, 'Số điện thoại bàn phải có 11 chữ số')
      .nullable();
  }

  if (activeStep >= 3) {
    baseSchema.otp = Yup.string()
      .matches(/^[0-9]{6}$/, 'Mã OTP phải có 6 chữ số')
      .required('Vui lòng nhập mã OTP');
  }

  return Yup.object(baseSchema);
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [otpSent, setOtpSent] = useState(false);
  const currentStepRef = React.useRef(0);

  // Update ref when activeStep changes
  React.useEffect(() => {
    currentStepRef.current = activeStep;
  }, [activeStep]);

  // Mask email function
  const maskEmail = (email) => {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local[0] + '*'.repeat(Math.max(0, local.length - 2)) + (local.length > 1 ? local[local.length - 1] : '');
    const [domainName, extension] = domain.split('.');
    const maskedDomain = domainName[0] + '*'.repeat(Math.max(0, domainName.length - 2)) + (domainName.length > 1 ? domainName[domainName.length - 1] : '');
    return `${maskedLocal}@${maskedDomain}.${extension}`;
  };

  // Countdown timer effect
  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    try {
      // Simulate OTP sending
      setOtpSent(true);
      setCountdown(48);
      // Here you would make an API call to send OTP
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const formik = useFormik({
    initialValues: {
      idType: '',
      personalId: '',
      fullName: '',
      dateOfBirth: null,
      gender: '',
      city: '',
      district: '',
      ward: '',
      street: '',
      mobilePhone: '',
      email: '',
      occupation: '',
      landlinePhone: '',
      otp: '',
    },
    validate: (values) => {
      try {
        getValidationSchema(currentStepRef.current).validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      if (activeStep === 1) {
        // Move to step 3 after completing step 2
        setActiveStep(2);
        return;
      }

      if (activeStep === 2) {
        // Send OTP and move to step 4 after completing step 3
        await sendOtp();
        setActiveStep(3);
        return;
      }

      // Submit registration data on step 4
      try {
        const registrationData = {
          ...values,
          image: uploadedImage,
        };
        await dispatch(register(registrationData)).unwrap();
        navigate('/');
      } catch (err) {
        // Error is handled by the auth slice
      }
    },
  });

  // Update validation when step changes
  React.useEffect(() => {
    formik.validateForm();
  }, [activeStep]);

  const handleNext = () => {
    if (activeStep === 0 && !uploadedImage) {
      alert('Vui lòng tải lên ảnh giấy tờ');
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Đăng ký tài khoản
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Để đăng ký tài khoản vui lòng cung cấp thông tin giấy tờ tùy thân của người hiến máu.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng chuẩn bị giấy tờ tùy thân để hệ thống ghi nhận lại mặt trước của giấy tờ tùy thân.
            </Typography>

            <Paper
              sx={{
                border: '2px dashed #ccc',
                borderRadius: 2,
                p: 4,
                mb: 3,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50',
                },
              }}
              onClick={() => document.getElementById('image-upload').click()}
            >
              {uploadedImage ? (
                <Box>
                  <img
                    src={uploadedImage}
                    alt="Uploaded ID"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      marginBottom: 16,
                    }}
                  />
                  <Typography variant="body2" color="primary.main">
                    Ảnh đã được tải lên thành công
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Cách 1: Kéo và thả file tại đây
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Hoặc
                  </Typography>
                  <Button variant="contained" startIcon={<PhotoCameraIcon />}>
                    Chọn file để tải lên
                  </Button>
                </Box>
              )}
            </Paper>

            <input
              id="image-upload"
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleNext}
              disabled={!uploadedImage}
              sx={{ mt: 2 }}
            >
              Tiếp theo
            </Button>

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Typography variant="body2">
                Đã có tài khoản?{' '}
                <Link component={RouterLink} to="/login">
                  Đăng nhập ngay
                </Link>
              </Typography>
            </Box>
          </Box>
        );

      case 1:
        return (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Nhập thông tin giấy tờ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng nhập thông tin trên giấy tờ và bấm "xác nhận" để hoàn thành.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Loại giấy tờ */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Chọn loại giấy tờ</InputLabel>
                  <Select
                    name="idType"
                    value={formik.values.idType}
                    onChange={formik.handleChange}
                    error={formik.touched.idType && Boolean(formik.errors.idType)}
                  >
                    {idTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.idType && formik.errors.idType && (
                    <Typography variant="caption" color="error">
                      {formik.errors.idType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Số CMND */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Nhập đầy đủ 09 chữ số được in trên chứng minh nhân dân
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="personalId"
                  label="Số chứng minh nhân dân (*)"
                  placeholder="VD: 123456789"
                  value={formik.values.personalId}
                  onChange={formik.handleChange}
                  error={formik.touched.personalId && Boolean(formik.errors.personalId)}
                  helperText={formik.touched.personalId && formik.errors.personalId}
                  inputProps={{ maxLength: 12 }}
                />
              </Grid>

              {/* Họ và tên */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Nhập họ và tên đầy đủ theo chứng minh nhân dân
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="fullName"
                  label="Họ và tên (*)"
                  placeholder="VD: Nguyễn Văn A"
                  value={formik.values.fullName}
                  onChange={formik.handleChange}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  inputProps={{ maxLength: 60 }}
                />
              </Grid>

              {/* Ngày sinh */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Chọn hoặc nhập ngày tháng năm sinh theo định dạng: Ngày/Tháng/Năm
                  </Typography>
                </Box>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                    label="Ngày sinh (*)"
                    value={formik.values.dateOfBirth}
                    onChange={(value) => formik.setFieldValue('dateOfBirth', value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        placeholder="VD: 01/01/1990"
                        error={formik.touched.dateOfBirth && Boolean(formik.errors.dateOfBirth)}
                        helperText={formik.touched.dateOfBirth && formik.errors.dateOfBirth}
                      />
                    )}
                  />
                </LocalizationProvider>
              </Grid>

              {/* Giới tính */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Chọn giới tính đăng ký theo loại giấy tờ đã chọn
                  </Typography>
                </Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Giới tính (*)
                </Typography>
                <RadioGroup
                  row
                  name="gender"
                  value={formik.values.gender}
                  onChange={formik.handleChange}
                >
                  <FormControlLabel value="male" control={<Radio />} label="Nam" />
                  <FormControlLabel value="female" control={<Radio />} label="Nữ" />
                </RadioGroup>
                {formik.touched.gender && formik.errors.gender && (
                  <Typography variant="caption" color="error">
                    {formik.errors.gender}
                  </Typography>
                )}
              </Grid>

              {/* Địa chỉ liên hệ */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Địa chỉ liên hệ (*)
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Địa chỉ của nơi bạn đang sinh sống. Vui điền đầy đủ thông tin bên dưới
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  {/* Tỉnh/Thành phố */}
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Tỉnh/Thành phố</InputLabel>
                      <Select
                        name="city"
                        value={formik.values.city}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldValue('district', '');
                          formik.setFieldValue('ward', '');
                        }}
                        error={formik.touched.city && Boolean(formik.errors.city)}
                      >
                        {cities.map((city) => (
                          <MenuItem key={city} value={city}>
                            {city}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Quận/Huyện */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!formik.values.city}>
                      <InputLabel>Quận/Huyện</InputLabel>
                      <Select
                        name="district"
                        value={formik.values.district}
                        onChange={(e) => {
                          formik.handleChange(e);
                          formik.setFieldValue('ward', '');
                        }}
                        error={formik.touched.district && Boolean(formik.errors.district)}
                      >
                        {districts[formik.values.city]?.map((district) => (
                          <MenuItem key={district} value={district}>
                            {district}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Phường/Xã */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth disabled={!formik.values.district}>
                      <InputLabel>Phường/Xã</InputLabel>
                      <Select
                        name="ward"
                        value={formik.values.ward}
                        onChange={formik.handleChange}
                        error={formik.touched.ward && Boolean(formik.errors.ward)}
                      >
                        {wards[formik.values.district]?.map((ward) => (
                          <MenuItem key={ward} value={ward}>
                            {ward}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Số nhà, tên đường */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      name="street"
                      label="Số nhà, tên đường"
                      placeholder="Nhập số nhà, tên đường"
                      value={formik.values.street}
                      onChange={formik.handleChange}
                      error={formik.touched.street && Boolean(formik.errors.street)}
                      helperText={formik.touched.street && formik.errors.street}
                      inputProps={{ maxLength: 120 }}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                Tiếp tục
              </Button>
            </Box>
          </Box>
        );

      case 2:
        return (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Hồ sơ hiến máu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng nhập thông tin hồ sơ hiến máu và bấm "xác nhận" để hoàn thành.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Điện thoại di động */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Số điện thoại của bạn hoặc bất kỳ số nào mà chúng tôi có thể liên lạc. Số điện thoại di động gồm 10 chữ số
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="mobilePhone"
                  label="Điện thoại di động (*)"
                  placeholder="VD: 0909090909"
                  value={formik.values.mobilePhone}
                  onChange={formik.handleChange}
                  error={formik.touched.mobilePhone && Boolean(formik.errors.mobilePhone)}
                  helperText={formik.touched.mobilePhone && formik.errors.mobilePhone}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              {/* Email */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Vui lòng cung cấp địa chỉ email để xác thực tài khoản và nhận kết quả máu. Email phải đúng theo định dạng: emailnguoihienmau@gmail.com
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="email"
                  label="Email (*)"
                  placeholder="Vui lòng nhập email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  inputProps={{ maxLength: 60 }}
                />
              </Grid>

              {/* Nghề nghiệp */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Nghề nghiệp (*)</InputLabel>
                  <Select
                    name="occupation"
                    value={formik.values.occupation}
                    onChange={formik.handleChange}
                    error={formik.touched.occupation && Boolean(formik.errors.occupation)}
                  >
                    {occupations.map((occupation) => (
                      <MenuItem key={occupation} value={occupation}>
                        {occupation}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.occupation && formik.errors.occupation && (
                    <Typography variant="caption" color="error">
                      {formik.errors.occupation}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              {/* Điện thoại bàn */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Số điện thoại bàn mà chúng tôi có thể liên hệ với bạn (nếu có). Số điện thoại bàn gồm 11 chữ số
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="landlinePhone"
                  label="Điện thoại bàn"
                  placeholder="VD: 02809090909"
                  value={formik.values.landlinePhone}
                  onChange={formik.handleChange}
                  error={formik.touched.landlinePhone && Boolean(formik.errors.landlinePhone)}
                  helperText={formik.touched.landlinePhone && formik.errors.landlinePhone}
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác nhận'}
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Nhập mã xác thực
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nhập mã xác thực đã được gửi đến địa chỉ Email
            </Typography>
            <Typography variant="body2" color="primary.main" sx={{ mb: 4, fontWeight: 'bold' }}>
              {maskEmail(formik.values.email)}
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* OTP Input Boxes */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 4 }}>
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <TextField
                  key={index}
                  sx={{
                    width: 56,
                    height: 56,
                    '& .MuiOutlinedInput-root': {
                      height: 56,
                      '& fieldset': {
                        borderColor: '#e0e0e0',
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                  inputProps={{
                    maxLength: 1,
                    style: { textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' },
                    'data-index': index,
                  }}
                  value={formik.values.otp[index] || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^\d*$/.test(value)) {
                      const newOtp = formik.values.otp.split('');
                      newOtp[index] = value;
                      formik.setFieldValue('otp', newOtp.join(''));

                      // Auto focus next input
                      if (value && index < 5) {
                        const nextInput = document.querySelector(`input[data-index="${index + 1}"]`);
                        if (nextInput) nextInput.focus();
                      }
                    }
                  }}
                  onKeyDown={(e) => {
                    // Handle backspace
                    if (e.key === 'Backspace' && !formik.values.otp[index] && index > 0) {
                      const prevInput = document.querySelector(`input[data-index="${index - 1}"]`);
                      if (prevInput) prevInput.focus();
                    }
                  }}
                />
              ))}
            </Box>

            {formik.touched.otp && formik.errors.otp && (
              <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                {formik.errors.otp}
              </Typography>
            )}

            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={formik.handleSubmit}
              disabled={loading || formik.values.otp.length !== 6}
              sx={{ mb: 3 }}
            >
              {loading ? 'Đang xử lý...' : 'Tiếp tục'}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Gửi lại mã OTP ({countdown}s)
                </Typography>
              ) : (
                <Button
                  variant="text"
                  onClick={sendOtp}
                  sx={{ textTransform: 'none' }}
                >
                  Gửi lại mã OTP
                </Button>
              )}
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 5 }, maxWidth: 900, mx: 'auto' }}>
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {renderStepContent(activeStep)}
      </Paper>
    </Container>
  );
};

export default Signup; 
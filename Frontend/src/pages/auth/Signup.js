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
  Container,
  InputAdornment,
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
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LockIcon from '@mui/icons-material/Lock';
import dayjs from 'dayjs';

const steps = ['Chọn loại tài khoản', 'Nhập thông tin', 'Hồ sơ hiến máu', 'Tạo mật khẩu'];

// const idTypes = [
//   'Chứng minh nhân dân',
//   'Căn cước công dân',
//   'Hộ chiếu',
// ];

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
  const baseSchema = {};

  if (activeStep >= 0) {
    baseSchema.accountType = Yup.string().required('Vui lòng chọn loại tài khoản');
  }

  if (activeStep >= 1) {
    baseSchema.personalId = Yup.string()
      .matches(/^[0-9]{12}$/, 'Số CCCD phải có 12 chữ số')
      .required('Vui lòng nhập số CCCD');
    baseSchema.fullName = Yup.string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .required('Vui lòng nhập họ và tên');
    baseSchema.dateOfBirth = Yup.date()
      .nullable()
      .max(new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại')
      .test('age', 'Người hiến máu phải từ 16 đến 60 tuổi', function (value) {
        if (!value) return false;
        const today = dayjs();
        const birthDate = dayjs(value);
        const age = today.diff(birthDate, 'year');
        return age >= 16 && age <= 60;
      })
      .required('Vui lòng chọn ngày sinh');
    baseSchema.gender = Yup.string().required('Vui lòng chọn giới tính');
    baseSchema.city = Yup.string().required('Vui lòng chọn tỉnh/thành phố');
    baseSchema.district = Yup.string().required('Vui lòng chọn quận/huyện');
    baseSchema.street = Yup.string().required('Vui lòng nhập số nhà, tên đường');
  }

  if (activeStep >= 2) {
    baseSchema.mobilePhone = Yup.string()
      .matches(/^[0-9]{10}$/, 'Số điện thoại di động phải có 10 chữ số')
      .required('Vui lòng nhập số điện thoại di động');
    baseSchema.email = Yup.string()
      .email('Email không đúng định dạng')
      .required('Vui lòng nhập email');
    baseSchema.occupation = Yup.string().required('Vui lòng chọn nghề nghiệp');
    baseSchema.weight = Yup.number()
      .positive('Cân nặng phải là số dương')
      .required('Vui lòng nhập cân nặng');
    baseSchema.height = Yup.number()
      .positive('Chiều cao phải là số dương') 
      .required('Vui lòng nhập chiều cao');
  }

  if (activeStep >= 3) {
    baseSchema.password = Yup.string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Mật khẩu phải có ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt'
      )
      .required('Vui lòng nhập mật khẩu');
    baseSchema.confirmPassword = Yup.string()
      .oneOf([Yup.ref('password'), null], 'Xác nhận mật khẩu không khớp')
      .required('Vui lòng xác nhận mật khẩu');
  }

  return Yup.object(baseSchema);
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentStepRef = React.useRef(0);

  // Update ref when activeStep changes
  React.useEffect(() => {
    currentStepRef.current = activeStep;
  }, [activeStep]);

  const formik = useFormik({
    initialValues: {
      accountType: '',
      personalId: '',
      fullName: '',
      dateOfBirth: null,
      gender: '',
      city: '',
      district: '',
      street: '',
      mobilePhone: '',
      weight: '',
      height: '',
      email: '',
      occupation: '',
      password: '',
      confirmPassword: '',
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
      if (activeStep < 3) {
        setActiveStep(activeStep + 1);
        return;
      }

      // Submit registration data on final step
      try {
        const registrationData = {
          ...values,
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
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Chọn loại tài khoản
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng chọn loại tài khoản phù hợp với nhu cầu của bạn.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    border: formik.values.accountType === 'donor' ? '2px solid #e53935' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                    backgroundColor: formik.values.accountType === 'donor' ? '#ffebee' : 'white',
                  }}
                  onClick={() => formik.setFieldValue('accountType', 'donor')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <BloodtypeIcon sx={{ fontSize: 64, color: '#e53935', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Tài khoản hiến máu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dành cho những người muốn hiến máu, tham gia các hoạt động hiến máu nhân đạo
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Radio
                        checked={formik.values.accountType === 'donor'}
                        onChange={() => formik.setFieldValue('accountType', 'donor')}
                        value="donor"
                        name="accountType"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    border: formik.values.accountType === 'recipient' ? '2px solid #e53935' : '1px solid #e0e0e0',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 3,
                      transform: 'translateY(-2px)',
                    },
                    backgroundColor: formik.values.accountType === 'recipient' ? '#ffebee' : 'white',
                  }}
                  onClick={() => formik.setFieldValue('accountType', 'recipient')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <LocalHospitalIcon sx={{ fontSize: 64, color: '#e53935', mb: 2 }} />
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Tài khoản truyền máu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Dành cho bệnh nhân, người cần truyền máu hoặc tìm kiếm người hiến máu
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Radio
                        checked={formik.values.accountType === 'recipient'}
                        onChange={() => formik.setFieldValue('accountType', 'recipient')}
                        value="recipient"
                        name="accountType"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {formik.touched.accountType && formik.errors.accountType && (
              <Typography variant="caption" color="error" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                {formik.errors.accountType}
              </Typography>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button onClick={handleBack} disabled>
                Quay lại
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={!formik.values.accountType}
              >
                Tiếp tục
              </Button>
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
              {/* Số CMND */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Nhập đầy đủ 12 chữ số được in trên căn cước công dân
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="personalId"
                  label="Số CCCD(*)"
                  placeholder="VD: 123456789012"
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
                        onChange={formik.handleChange}
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
                    Vui lòng cung cấp địa chỉ email để nhận kết quả máu. Email phải đúng theo định dạng: emailnguoihienmau@gmail.com
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

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Vui lòng cung cấp cân nặng của bạn để chúng tôi có thể xác định khả năng hiến máu. Cân nặng phải là số dương.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="weight"
                  type="number"
                  label="Cân nặng (*)"
                  placeholder="Vui lòng nhập cân nặng"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                  inputProps={{ maxLength: 10 }}
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Vui lòng cung cấp chiêu cao của bạn để chúng tôi có thể xác định khả năng hiến máu. Chiều cao phải là số dương.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="height"
                  label="Chiều cao (*)"
                  placeholder="Vui lòng nhập chiều cao"
                  type="number"
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  error={formik.touched.height && Boolean(formik.errors.height)}
                  helperText={formik.touched.height && formik.errors.height}
                  inputProps={{ maxLength: 10 }}
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
                Tiếp tục
              </Button>
            </Box>
          </Box>
        );

      case 3:
        return (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Tạo mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Tạo mật khẩu bảo mật cho tài khoản của bạn để hoàn tất quá trình đăng ký.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <LockIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="h6" color="primary.main">
                    Thông tin bảo mật
                  </Typography>
                </Box>
              </Grid>

              {/* Mật khẩu */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="password"
                  label="Mật khẩu (*)"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Xác nhận mật khẩu */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu (*)"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle confirm password visibility"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
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
                Hoàn thành đăng ký
              </Button>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      minWidth: '100vw',
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: 'url(/images/Login.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      zIndex: 0,
      overflowY: 'auto',
    }}>
      {/* Logo */}
      <Box sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        bgcolor: '#fff',
        px: 4,
        height: 70,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        zIndex: 2,
        justifyContent: 'center',
      }}>
        <Link component={RouterLink} to="/home" underline="none" sx={{ display: 'flex', alignItems: 'center' }}>
          <img src="/images/logo.png" alt="logo" style={{ height: 40, marginRight: 8 }} />
          <Typography variant="h5" fontWeight="bold" color="#e53935" sx={{ letterSpacing: 2 }}>
            Hệ Thống Hỗ Trợ Hiến Máu
          </Typography>
        </Link>
      </Box>
      {/* Form đăng ký */}
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
    </Box>
  );
};

export default Signup;
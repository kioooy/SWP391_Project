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

const steps = ['Chọn loại tài khoản', 'Nhập thông tin', 'Hồ sơ hiến máu', 'Đặt mật khẩu'];

const accountTypes = [
  'Hiến máu',
  'Truyền máu',
];

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

/* const wards = {
  'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
  'Quận 2': ['Phường An Phú', 'Phường An Khánh', 'Phường Bình An', 'Phường Bình Khánh', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Thảo Điền', 'Phường Thạnh Mỹ Lợi', 'Phường Thu Thiêm'],
  'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
  'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'],
  'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
  'Hoàn Kiếm': ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Đồng Xuân', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Buồm', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo'],
  'Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'],
  'Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước'],
}; */

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
  switch (activeStep) {
    case 0:
      return Yup.object({
        accountType: Yup.string().required('Vui lòng chọn loại tài khoản'),
      });
    case 1:
      return Yup.object({
        personalId: Yup.string()
          .matches(/^[0-9]{12}$/, 'Số CCCD phải có 12 chữ số')
          .required('Vui lòng nhập số CCCD'),
        fullName: Yup.string()
          .min(2, 'Họ tên phải có ít nhất 2 ký tự')
          .required('Vui lòng nhập họ và tên'),
        dateOfBirth: Yup.date()
          .nullable()
          .max(new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại')
          .test('age', 'Người hiến máu phải từ 16 đến 60 tuổi', function(value) {
            if (!value) return false;
            const today = dayjs();
            const birthDate = dayjs(value);
            const age = today.diff(birthDate, 'year');
            return age >= 16 && age <= 60;
          })
          .required('Vui lòng chọn ngày sinh'),
        gender: Yup.string().required('Vui lòng chọn giới tính'),
        city: Yup.string().required('Vui lòng chọn tỉnh/thành phố'),
        district: Yup.string().required('Vui lòng chọn quận/huyện'),
        street: Yup.string().required('Vui lòng nhập số nhà, tên đường'),
      });
    case 2:
      return Yup.object({
        mobilePhone: Yup.string()
          .matches(/^[0-9]{10}$/, 'Số điện thoại di động phải có 10 chữ số')
          .required('Vui lòng nhập số điện thoại di động'),
        email: Yup.string()
          .email('Email không đúng định dạng')
          .required('Vui lòng nhập email'),
        occupation: Yup.string().required('Vui lòng chọn nghề nghiệp'),
        height: Yup.number()
          .typeError('Chiều cao phải là số')
          .min(100, 'Chiều cao phải từ 100cm trở lên')
          .max(250, 'Chiều cao không được vượt quá 250cm')
          .required('Vui lòng nhập chiều cao'),
        weight: Yup.number()
          .typeError('Cân nặng phải là số')
          .min(30, 'Cân nặng phải từ 30kg trở lên')
          .max(200, 'Cân nặng không được vượt quá 200kg')
          .required('Vui lòng nhập cân nặng'),
      });
    case 3:
      return Yup.object({
        password: Yup.string()
          .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
          .matches(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
          .matches(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
          .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
          .required('Vui lòng nhập mật khẩu'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
          .required('Vui lòng xác nhận mật khẩu'),
      });
    default:
      return Yup.object({});
  }
};

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.auth);

  const [activeStep, setActiveStep] = useState(0);
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
      email: '',
      occupation: '',
      height: '',
      weight: '',
      password: '',
      confirmPassword: '',
    },
    validate: (values) => {
      console.log('Validating step', currentStepRef.current, 'with values:', values);
      try {
        // Get schema for the current step based on the ref
        const currentStepValidationSchema = getValidationSchema(currentStepRef.current);
        // Only validate the fields present in the current step's schema
        const currentStepFields = Object.keys(currentStepValidationSchema.fields);
        const valuesToValidate = Object.keys(values)
          .filter(key => currentStepFields.includes(key))
          .reduce((obj, key) => {
            obj[key] = values[key];
            return obj;
          }, {});

        console.log('Values to validate for step', currentStepRef.current, ':', valuesToValidate);
        currentStepValidationSchema.validateSync(valuesToValidate, { abortEarly: false });
        console.log('Validation successful for step', currentStepRef.current);
        return {};
      } catch (error) {
        console.log('Validation failed for step', currentStepRef.current, 'with errors:', error.inner);
        const errors = {};
        error.inner.forEach((err) => {
          // Only set errors for fields in the current step
          if (Object.keys(getValidationSchema(currentStepRef.current).fields).includes(err.path)) {
             errors[err.path] = err.message;
          }
        });
        return errors;
      }
    },
    onSubmit: async (values) => {
      // formik.handleSubmit automatically triggers validate before calling onSubmit
      // If validate passes, this function is called.

      // Check if it's the last step
      if (activeStep === steps.length - 1) {
        // Submit registration data on the final step
        try {
          const registrationData = {
            ...values,
          };
          await dispatch(register(registrationData)).unwrap();
          navigate('/');
        } catch (err) {
          // Error is handled by the auth slice
        }
      } else {
        // Move to the next step if validation passed and it's not the last step
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
      }
    },
  });

  // Update validation when step changes
  React.useEffect(() => {
    formik.validateForm();
  }, [activeStep]);

  const handleNext = () => {
    // This function is no longer needed as onSubmit handles step progression
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
              Vui lòng chọn loại tài khoản bạn muốn đăng ký
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth error={formik.touched.accountType && Boolean(formik.errors.accountType)}>
                  <InputLabel>Loại tài khoản (*)</InputLabel>
                  <Select
                    name="accountType"
                    value={formik.values.accountType}
                    onChange={formik.handleChange}
                    // error prop is now on FormControl
                  >
                    {accountTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.accountType && formik.errors.accountType && (
                    <Typography variant="caption" color="error">
                      {formik.errors.accountType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Quay lại
                </Button>
              )}
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

      case 1:
        return (
          <Box component="form" onSubmit={formik.handleSubmit}>
            <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
              Nhập thông tin
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng nhập thông tin cá nhân của bạn
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
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Quay lại
                </Button>
              )}
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

              {/* Chiều cao */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="height"
                  label="Chiều cao (cm) (*)"
                  type="number"
                  placeholder="VD: 170"
                  value={formik.values.height}
                  onChange={formik.handleChange}
                  error={formik.touched.height && Boolean(formik.errors.height)}
                  helperText={formik.touched.height && formik.errors.height}
                  InputProps={{
                    inputProps: { min: 100, max: 250 },
                    sx: {
                      'input[type=number]': {
                        '-moz-appearance': 'textfield',
                      },
                      'input[type=number]::-webkit-outer-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                      'input[type=number]::-webkit-inner-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                    },
                  }}
                />
              </Grid>

              {/* Cân nặng */}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="weight"
                  label="Cân nặng (kg) (*)"
                  type="number"
                  placeholder="VD: 65"
                  value={formik.values.weight}
                  onChange={formik.handleChange}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                  InputProps={{
                    inputProps: { min: 30, max: 200 },
                    sx: {
                      'input[type=number]': {
                        '-moz-appearance': 'textfield',
                      },
                      'input[type=number]::-webkit-outer-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                      'input[type=number]::-webkit-inner-spin-button': {
                        '-webkit-appearance': 'none',
                        margin: 0,
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Quay lại
                </Button>
              )}
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
              Đặt mật khẩu
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Vui lòng đặt mật khẩu cho tài khoản của bạn
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Mật khẩu */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  name="password"
                  label="Mật khẩu (*)"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>

              {/* Xác nhận mật khẩu */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  name="confirmPassword"
                  label="Xác nhận mật khẩu (*)"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Quay lại
                </Button>
              )}
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

      default:
        return 'Unknown step';
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
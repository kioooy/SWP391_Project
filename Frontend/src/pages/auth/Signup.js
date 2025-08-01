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

const steps = ['Chọn loại tài khoản', 'Nhập thông tin', 'Hồ sơ hiến máu', 'Tạo mật khẩu', 'Xác nhận thông tin'];

// const idTypes = [
//   'Chứng minh nhân dân',
//   'Căn cước công dân',
//   'Hộ chiếu',
// ];

const cities = [
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
  'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
  'Cần Thơ', 'Cao Bằng', 'Đà Nẵng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Nội',
  'Hà Tĩnh', 'Hải Dương', 'Hải Phòng', 'Hậu Giang', 'Hòa Bình', 'Hưng Yên',
  'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu', 'Lâm Đồng', 'Lạng Sơn',
  'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình', 'Ninh Thuận',
  'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thừa Thiên Huế', 'Tiền Giang', 'TP Hồ Chí Minh', 'Trà Vinh',
  'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];

const districts = {
  'TP Hồ Chí Minh': ['Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Thủ Đức', 'Huyện Bình Chánh', 'Huyện Củ Chi', 'Huyện Hóc Môn', 'Huyện Nhà Bè'],
  'Hà Nội': ['Ba Đình', 'Hoàn Kiếm', 'Đống Đa', 'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Cầu Giấy', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Tây Hồ', 'Long Biên', 'Hà Đông', 'Sơn Tây', 'Chương Mỹ', 'Đan Phượng', 'Đông Anh', 'Gia Lâm', 'Hoài Đức', 'Mê Linh', 'Mỹ Đức', 'Phú Xuyên', 'Phúc Thọ', 'Quốc Oai', 'Sóc Sơn', 'Thạch Thất', 'Thanh Oai', 'Thanh Trì', 'Thường Tín', 'Ứng Hòa'],
  'Đà Nẵng': ['Hải Châu', 'Cẩm Lệ', 'Ngũ Hành Sơn', 'Sơn Trà', 'Liên Chiểu', 'Thanh Khê', 'Hòa Vang', 'Hoàng Sa'],
  'Cần Thơ': ['Ninh Kiều', 'Bình Thủy', 'Cái Răng', 'Ô Môn', 'Thốt Nốt', 'Phong Điền', 'Cờ Đỏ', 'Vĩnh Thạnh', 'Thới Lai'],
  'Hải Phòng': ['Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn', 'Dương Kinh', 'An Dương', 'An Lão', 'Kiến Thụy', 'Thủy Nguyên', 'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'],
  'An Giang': ['Thành phố Long Xuyên', 'Thành phố Châu Đốc', 'Huyện An Phú', 'Huyện Châu Phú', 'Huyện Châu Thành', 'Huyện Chợ Mới', 'Huyện Phú Tân', 'Huyện Thoại Sơn', 'Huyện Tịnh Biên', 'Huyện Tri Tôn'],
  'Bình Dương': ['Thành phố Thủ Dầu Một', 'Thị xã Bến Cát', 'Thị xã Tân Uyên', 'Huyện Bắc Tân Uyên', 'Huyện Bàu Bàng', 'Huyện Dầu Tiếng', 'Huyện Phú Giáo', 'Thị xã Dĩ An', 'Thị xã Thuận An'],
  'Đồng Nai': ['Thành phố Biên Hòa', 'Thành phố Long Khánh', 'Huyện Cẩm Mỹ', 'Huyện Định Quán', 'Huyện Long Thành', 'Huyện Nhơn Trạch', 'Huyện Tân Phú', 'Huyện Thống Nhất', 'Huyện Trảng Bom', 'Huyện Vĩnh Cửu', 'Huyện Xuân Lộc'],
  'Nghệ An': ['Thành phố Vinh', 'Thị xã Cửa Lò', 'Thị xã Thái Hòa', 'Huyện Anh Sơn', 'Huyện Con Cuông', 'Huyện Diễn Châu', 'Huyện Đô Lương', 'Huyện Hưng Nguyên', 'Huyện Kỳ Sơn', 'Huyện Nam Đàn', 'Huyện Nghi Lộc', 'Huyện Nghĩa Đàn', 'Huyện Quế Phong', 'Huyện Quỳ Châu', 'Huyện Quỳ Hợp', 'Huyện Quỳnh Lưu', 'Huyện Tân Kỳ', 'Huyện Thanh Chương', 'Huyện Tương Dương', 'Huyện Yên Thành'],
  'Thanh Hóa': ['Thành phố Thanh Hóa', 'Thị xã Bỉm Sơn', 'Thị xã Sầm Sơn', 'Huyện Bá Thước', 'Huyện Cẩm Thủy', 'Huyện Đông Sơn', 'Huyện Hà Trung', 'Huyện Hậu Lộc', 'Huyện Hoằng Hóa', 'Huyện Lang Chánh', 'Huyện Mường Lát', 'Huyện Nga Sơn', 'Huyện Ngọc Lặc', 'Huyện Như Thanh', 'Huyện Như Xuân', 'Huyện Nông Cống', 'Huyện Quan Hóa', 'Huyện Quan Sơn', 'Huyện Quảng Xương', 'Huyện Thạch Thành', 'Huyện Thiệu Hóa', 'Huyện Thọ Xuân', 'Huyện Thường Xuân', 'Huyện Tĩnh Gia', 'Huyện Triệu Sơn', 'Huyện Vĩnh Lộc', 'Huyện Yên Định'],
  'Bà Rịa - Vũng Tàu': ['Thành phố Vũng Tàu', 'Huyện Long Điền', 'Huyện Đất Đỏ'],
  'Bắc Giang': ['Thành phố Bắc Giang', 'Huyện Lục Nam'],
  'Bắc Kạn': ['Thành phố Bắc Kạn', 'Huyện Ba Bể'],
  'Bạc Liêu': ['Thành phố Bạc Liêu', 'Huyện Hòa Bình'],
  'Bắc Ninh': ['Thành phố Bắc Ninh', 'Huyện Quế Võ'],
  'Bến Tre': ['Thành phố Bến Tre', 'Huyện Châu Thành'],
  'Bình Định': ['Thành phố Quy Nhơn', 'Huyện Tuy Phước'],
  'Bình Phước': ['Thị xã Đồng Xoài', 'Huyện Bù Đăng'],
  'Bình Thuận': ['Thành phố Phan Thiết', 'Huyện Hàm Thuận Bắc'],
  'Cà Mau': ['Thành phố Cà Mau', 'Huyện Đầm Dơi'],
  'Cao Bằng': ['Thành phố Cao Bằng', 'Huyện Trùng Khánh'],
  'Đắk Lắk': ['Thành phố Buôn Ma Thuột', 'Huyện Krông Pắc'],
  'Đắk Nông': ['Thị xã Gia Nghĩa', 'Huyện Đắk Mil'],
  'Điện Biên': ['Thành phố Điện Biên Phủ', 'Huyện Mường Nhé'],
  'Đồng Tháp': ['Thành phố Cao Lãnh', 'Huyện Lai Vung'],
  'Gia Lai': ['Thành phố Pleiku', 'Huyện Chư Sê'],
  'Hà Giang': ['Thành phố Hà Giang', 'Huyện Đồng Văn'],
  'Hà Nam': ['Thành phố Phủ Lý', 'Huyện Kim Bảng'],
  'Hà Tĩnh': ['Thành phố Hà Tĩnh', 'Huyện Cẩm Xuyên'],
  'Hải Dương': ['Thành phố Hải Dương', 'Huyện Gia Lộc'],
  'Hậu Giang': ['Thành phố Vị Thanh', 'Huyện Châu Thành A'],
  'Hòa Bình': ['Thành phố Hòa Bình', 'Huyện Lương Sơn'],
  'Hưng Yên': ['Thành phố Hưng Yên', 'Huyện Văn Lâm'],
  'Khánh Hòa': ['Thành phố Nha Trang', 'Huyện Diên Khánh'],
  'Kiên Giang': ['Thành phố Rạch Giá', 'Huyện Phú Quốc'],
  'Kon Tum': ['Thành phố Kon Tum', 'Huyện Đắk Hà'],
  'Lai Châu': ['Thành phố Lai Châu', 'Huyện Phong Thổ'],
  'Lâm Đồng': ['Thành phố Đà Lạt', 'Huyện Đức Trọng'],
  'Lạng Sơn': ['Thành phố Lạng Sơn', 'Huyện Cao Lộc'],
  'Lào Cai': ['Thành phố Lào Cai', 'Huyện Sa Pa'],
  'Long An': ['Thành phố Tân An', 'Huyện Đức Hòa'],
  'Nam Định': ['Thành phố Nam Định', 'Huyện Hải Hậu'],
  'Ninh Bình': ['Thành phố Ninh Bình', 'Huyện Gia Viễn'],
  'Ninh Thuận': ['Thành phố Phan Rang-Tháp Chàm', 'Huyện Ninh Phước'],
  'Phú Thọ': ['Thành phố Việt Trì', 'Huyện Lâm Thao'],
  'Phú Yên': ['Thành phố Tuy Hòa', 'Huyện Đông Hòa'],
  'Quảng Bình': ['Thành phố Đồng Hới', 'Huyện Bố Trạch'],
  'Quảng Nam': ['Thành phố Tam Kỳ', 'Huyện Thăng Bình'],
  'Quảng Ngãi': ['Thành phố Quảng Ngãi', 'Huyện Bình Sơn'],
  'Quảng Ninh': ['Thành phố Hạ Long', 'Huyện Đông Triều'],
  'Quảng Trị': ['Thành phố Đông Hà', 'Huyện Triệu Phong'],
  'Sóc Trăng': ['Thành phố Sóc Trăng', 'Huyện Mỹ Xuyên'],
  'Sơn La': ['Thành phố Sơn La', 'Huyện Mộc Châu'],
  'Tây Ninh': ['Thành phố Tây Ninh', 'Huyện Hòa Thành'],
  'Thái Bình': ['Thành phố Thái Bình', 'Huyện Quỳnh Phụ'],
  'Thái Nguyên': ['Thành phố Thái Nguyên', 'Huyện Phổ Yên'],
  'Thừa Thiên Huế': ['Thành phố Huế', 'Huyện Phú Vang'],
  'Tiền Giang': ['Thành phố Mỹ Tho', 'Huyện Cai Lậy'],
  'Trà Vinh': ['Thành phố Trà Vinh', 'Huyện Càng Long'],
  'Tuyên Quang': ['Thành phố Tuyên Quang', 'Huyện Sơn Dương'],
  'Vĩnh Long': ['Thành phố Vĩnh Long', 'Huyện Long Hồ'],
  'Vĩnh Phúc': ['Thành phố Vĩnh Yên', 'Huyện Yên Lạc'],
  'Yên Bái': ['Thành phố Yên Bái', 'Huyện Lục Yên']
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

const bloodTypes = [
  { id: 1, label: 'A+' },
  { id: 2, label: 'A-' },
  { id: 3, label: 'B+' },
  { id: 4, label: 'B-' },
  { id: 5, label: 'AB+' },
  { id: 6, label: 'AB-' },
  { id: 7, label: 'O+' },
  { id: 8, label: 'O-' },
  { id: 99, label: 'Không biết' },
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
      .max(60, 'Họ tên không được vượt quá 60 ký tự')
      .matches(/^[\p{L}\s'-]+$/u, 'Họ tên chỉ được chứa chữ cái và khoảng trắng')
      .required('Vui lòng nhập họ và tên');
    baseSchema.dateOfBirth = Yup.date()
      .nullable()
      .max(new Date(), 'Ngày sinh không được lớn hơn ngày hiện tại')
      .test('age', 'Người hiến máu phải từ 18 đến 60 tuổi', function (value) {
        if (!value) return false;
        const today = dayjs();
        const birthDate = dayjs(value);
        const age = today.diff(birthDate, 'year');
        return age >= 18 && age <= 60;
      })
      .required('Vui lòng chọn ngày sinh');
    baseSchema.gender = Yup.string().required('Vui lòng chọn giới tính');
    baseSchema.city = Yup.string().required('Vui lòng chọn tỉnh/thành phố');
    baseSchema.district = Yup.string().required('Vui lòng chọn quận/huyện');
    baseSchema.street = Yup.string()
      .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
      .max(120, 'Địa chỉ không được vượt quá 120 ký tự')
      .required('Vui lòng nhập số nhà, tên đường');
  }

  if (activeStep >= 2) {
    baseSchema.mobilePhone = Yup.string()
      .matches(/^0[3|5|7|8|9][0-9]{8}$/, 'Số điện thoại di động phải đúng định dạng Việt Nam (10 số, bắt đầu bằng 03, 05, 07, 08, 09)')
      .required('Vui lòng nhập số điện thoại di động');
    baseSchema.email = Yup.string()
      .email('Email không đúng định dạng')
      .required('Vui lòng nhập email');
    baseSchema.weight = Yup.number()
      .typeError('Vui lòng nhập cân nặng')
      .positive('Cân nặng phải là số dương')
      .min(45, 'Cân nặng tối thiểu là 45kg')
      .max(300, 'Cân nặng tối đa là 300kg')
      .required('Vui lòng nhập cân nặng');
    baseSchema.height = Yup.number()
      .typeError('Vui lòng nhập chiều cao')
      .positive('Chiều cao phải là số dương')
      .min(145, 'Chiều cao tối thiểu là 145cm')
      .max(300, 'Chiều cao tối đa là 300cm')
      .required('Vui lòng nhập chiều cao');
    baseSchema.bloodTypeId = Yup.string().required('Vui lòng chọn nhóm máu');
  }

  if (activeStep >= 3) {
    baseSchema.password = Yup.string()
      .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
      .max(50, 'Mật khẩu không được vượt quá 50 ký tự')
      .matches(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
      .matches(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
      .matches(/[0-9]/, 'Mật khẩu phải có ít nhất 1 số')
      .matches(/[@$!%*?&]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt (@$!%*?&)')
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

  // Debug logging for loading and error states
  React.useEffect(() => {
    console.log('=== DEBUG: Auth state changed ===');
    console.log('Loading:', loading);
    console.log('Error:', error);
  }, [loading, error]);

  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const currentStepRef = React.useRef(0);
  const [otherOccupation, setOtherOccupation] = useState('');

  // Update ref when activeStep changes
  React.useEffect(() => {
    currentStepRef.current = activeStep;
  }, [activeStep]);

  // Thêm hàm render xác nhận thông tin
  const renderConfirmation = () => {
    return (
      <Box>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="primary.main">
          Xác nhận thông tin đăng ký
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Xin vui lòng kiểm tra lại các thông tin bên dưới, các thông tin được cung cấp sẽ dùng để tạo tài khoản và liên lạc với bạn.
        </Typography>
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Loại tài khoản:</Typography>
              <Typography>{formik.values.accountType === 'donor' ? 'Hiến máu' : 'Truyền máu'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Họ và tên:</Typography>
              <Typography>{formik.values.fullName}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Số CCCD:</Typography>
              <Typography>{formik.values.personalId}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Ngày sinh:</Typography>
              <Typography>{formik.values.dateOfBirth ? dayjs(formik.values.dateOfBirth).format('DD/MM/YYYY') : ''}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Giới tính:</Typography>
              <Typography>{formik.values.gender === 'male' ? 'Nam' : 'Nữ'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Địa chỉ:</Typography>
              <Typography>{`${formik.values.street}, ${formik.values.district}, ${formik.values.city}`}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Số điện thoại:</Typography>
              <Typography>{formik.values.mobilePhone}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Email:</Typography>
              <Typography>{formik.values.email}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Cân nặng:</Typography>
              <Typography>{formik.values.weight} kg</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Chiều cao:</Typography>
              <Typography>{formik.values.height} cm</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Nhóm máu:</Typography>
              <Typography>{bloodTypes.find(b => b.id == formik.values.bloodTypeId)?.label || ''}</Typography>
            </Grid>
          </Grid>
        </Paper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button onClick={handleBack} sx={{ mr: 1 }}>
            Quay lại
          </Button>
          <Button
            type="button"
            variant="contained"
            onClick={formik.handleSubmit}
            disabled={loading}
          >
            Xác nhận & Đăng ký
          </Button>
        </Box>
      </Box>
    );
  };

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
      password: '',
      confirmPassword: '',
      bloodTypeId: '',
    },
    validate: (values) => {
      try {
        // Bỏ occupation khỏi validation
        const schema = getValidationSchema(currentStepRef.current);
        // Xóa occupation nếu có trong schema
        if (schema.fields && schema.fields.occupation) {
          delete schema.fields.occupation;
        }
        schema.validateSync(values, { abortEarly: false });
        return {};
      } catch (error) {
        const errors = {};
        error.inner.forEach((err) => {
          errors[err.path] = err.message;
        });
        return errors;
      }
    },
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values) => {

      console.log('=== DEBUG: onSubmit được gọi ===');
      console.log('Active step:', activeStep);
      console.log('Form values:', values);
      console.log('Form errors:', formik.errors);
      console.log('Form touched:', formik.touched);
      
      // Kiểm tra nếu chưa phải bước cuối cùng
      if (activeStep < 3) {
        console.log('=== DEBUG: Chưa phải bước cuối, chuyển sang bước tiếp theo ===');

        const errors = await formik.validateForm();
        console.log('Validation errors:', errors);
        if (Object.keys(errors).length > 0) {
          console.log('=== DEBUG: Có lỗi validation, không chuyển bước ===');
          formik.setTouched(
            Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {}),
            true
          );
          return;
        }
        console.log('=== DEBUG: Không có lỗi, chuyển sang bước tiếp theo ===');
        setActiveStep(activeStep + 1);
        return;
      }
      
      console.log('=== DEBUG: Đây là bước cuối cùng, bắt đầu đăng ký ===');
      // Submit registration data on final step
      try {
        console.log('=== DEBUG: Bắt đầu quá trình đăng ký ===');
        console.log('Step hiện tại:', activeStep);
        console.log('Form values:', values);
        
        const registrationData = {
          fullName: values.fullName,
          password: values.password,
          citizenNumber: values.personalId,
          email: values.email,
          phoneNumber: values.mobilePhone,
          dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null,
          sex: values.gender === 'male' ? true : false,
          address: `${values.street}, ${values.district}, ${values.city}`,
          roleId: values.accountType === 'donor' ? 1 : 2, // hoặc map theo backend
          bloodTypeId: values.bloodTypeId,
          weight: Number(values.weight),
          height: Number(values.height),
          isDonor: values.accountType === 'donor',
          isRecipient: values.accountType === 'recipient',
        };
        
        console.log('=== DEBUG: Dữ liệu đăng ký đã chuẩn bị ===');
        console.log('Registration data:', registrationData);
        console.log('Account type:', values.accountType);
        console.log('Role ID:', registrationData.roleId);
        
        console.log('=== DEBUG: Gửi request đăng ký ===');
        const result = await dispatch(register(registrationData)).unwrap();
        console.log('=== DEBUG: Đăng ký thành công ===');
        console.log('Registration result:', result);
        console.log('Chuyển hướng về trang chủ...');
        
        navigate('/');
        console.log('=== DEBUG: Hoàn thành đăng ký và chuyển hướng ===');
      } catch (err) {
        console.error('=== DEBUG: Lỗi đăng ký ===');
        console.error('Error details:', err);
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        // Error is handled by the auth slice
      }
    },
  });

  // Debug logging for fullName changes
  React.useEffect(() => {
    if (formik.values.fullName) {
      console.log('=== DEBUG: fullName value changed ===');
      console.log('Current fullName value:', formik.values.fullName);
      console.log('fullName length:', formik.values.fullName?.length);
      console.log('fullName characters:', Array.from(formik.values.fullName).map(c => `${c} (${c.charCodeAt(0)})`));
      
      // Kiểm tra xem có ký tự lạ không
      const suspiciousChars = Array.from(formik.values.fullName).filter(c => {
        const code = c.charCodeAt(0);
        return code > 127 && !/[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼỀỀỂưăạảấầẩẫậắằẳẵặẹẻẽềềểỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪễệỉịọỏốồổỗộớờởỡợụủứừỬỮỰỲỴÝỶỸửữựỳỵýỷỹ]/.test(c);
      });
      
      if (suspiciousChars.length > 0) {
        console.warn('=== WARNING: Suspicious characters detected ===');
        console.warn('Suspicious chars:', suspiciousChars);
      }
    }
  }, [formik.values.fullName]);

  // Update validation when step changes
  React.useEffect(() => {
    console.log('=== DEBUG: Validating form for step ===', activeStep);
    formik.validateForm().then(errors => {
      console.log('Validation errors for step', activeStep, ':', errors);
    });
  }, [activeStep]);

  // Debug logging for form validation
  React.useEffect(() => {
    console.log('=== DEBUG: Form validation state ===');
    console.log('Form is valid:', formik.isValid);
    console.log('Form is dirty:', formik.dirty);
    console.log('Form errors:', formik.errors);
    console.log('Form touched:', formik.touched);
  }, [formik.isValid, formik.errors, formik.touched]);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // Hàm làm sạch giá trị fullName
  const cleanFullName = (value) => {
    if (!value) return value;

    // Chỉ chuẩn hóa khoảng trắng, giữ nguyên mọi ký tự Unicode
    let cleaned = value
      .replace(/\s+/g, ' ') // Thay thế nhiều khoảng trắng liên tiếp bằng 1 khoảng trắng
      .trim(); // Loại bỏ khoảng trắng thừa ở đầu và cuối

    return cleaned;
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
                      Dành cho bệnh nhân, những người cần truyền máu 
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
              <Box />
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
              Vui lòng đúng nhập thông tin trên giấy tờ và bấm "xác nhận" để hoàn thành.
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
                  onChange={e => {
                    // Chỉ cho nhập số, tối đa 12 ký tự
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 12);
                    formik.setFieldValue('personalId', onlyNums);
                  }}
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
                  onChange={(e) => formik.setFieldValue('fullName', e.target.value)}
                  onBlur={(e) => {
                    const cleaned = cleanFullName(e.target.value);
                    formik.setFieldValue('fullName', cleaned);
                    formik.handleBlur(e);
                  }}
                  error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                  helperText={formik.touched.fullName && formik.errors.fullName}
                  inputProps={{
                    maxLength: 60,
                    autoComplete: 'new-password',
                    spellCheck: false,
                    autoCorrect: 'off',
                    autoCapitalize: 'words',
                  }}
                  autoComplete="new-password"
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
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      name="city"
                      label="Tỉnh/Thành phố"
                      value={formik.values.city}
                      onChange={e => {
                        formik.handleChange(e);
                        formik.setFieldValue('district', '');
                      }}
                      error={formik.touched.city && Boolean(formik.errors.city)}
                      helperText={formik.touched.city && formik.errors.city}
                    >
                      {cities.map((city) => (
                        <MenuItem key={city} value={city}>
                          {city}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Quận/Huyện */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      select
                      fullWidth
                      name="district"
                      label="Quận/Huyện"
                      value={formik.values.district}
                      onChange={formik.handleChange}
                      error={formik.touched.district && Boolean(formik.errors.district)}
                      helperText={formik.touched.district && formik.errors.district}
                      disabled={!formik.values.city}
                    >
                      {(districts[formik.values.city] || []).map((district) => (
                        <MenuItem key={district} value={district}>
                          {district}
                        </MenuItem>
                      ))}
                    </TextField>
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
                  onChange={e => {
                    // Chỉ cho nhập số, loại bỏ ký tự không phải số
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                    formik.setFieldValue('mobilePhone', onlyNums);
                  }}
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
                  type="text"
                  label="Cân nặng (kg) (*)"
                  placeholder="Vui lòng nhập cân nặng"
                  value={formik.values.weight}
                  onChange={e => {
                    // Chỉ cho nhập số, tối đa 3 ký tự
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                    formik.setFieldValue('weight', onlyNums);
                  }}
                  error={formik.touched.weight && Boolean(formik.errors.weight)}
                  helperText={formik.touched.weight && formik.errors.weight}
                  inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[0-9]*', style: { MozAppearance: 'textfield' } }}
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
                  label="Chiều cao (cm) (*)"
                  placeholder="Vui lòng nhập chiều cao"
                  type="text"
                  value={formik.values.height}
                  onChange={e => {
                    // Chỉ cho nhập số, tối đa 3 ký tự
                    const onlyNums = e.target.value.replace(/[^0-9]/g, '').slice(0, 3);
                    formik.setFieldValue('height', onlyNums);
                  }}
                  error={formik.touched.height && Boolean(formik.errors.height)}
                  helperText={formik.touched.height && formik.errors.height}
                  inputProps={{ maxLength: 3, inputMode: 'numeric', pattern: '[0-9]*', style: { MozAppearance: 'textfield' } }}
                />
              </Grid>

              {/* Nhóm máu */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Chọn nhóm máu của bạn. Nếu chưa biết, có thể chọn "Không biết" và cập nhật sau
                  </Typography>
                </Box>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Nhóm máu (*)</InputLabel>
                  <Select
                    name="bloodTypeId"
                    value={formik.values.bloodTypeId}
                    onChange={formik.handleChange}
                    error={formik.touched.bloodTypeId && Boolean(formik.errors.bloodTypeId)}
                    label="Nhóm máu (*)"
                    variant="outlined"
                  >
                    {bloodTypes.map((type) => (
                      <MenuItem key={type.id} value={type.id}>
                        {type.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.bloodTypeId && formik.errors.bloodTypeId && (
                    <Typography variant="caption" color="error">
                      {formik.errors.bloodTypeId}
                    </Typography>
                  )}
                </FormControl>
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
          <Box component="form" onSubmit={(e) => {
            console.log('=== DEBUG: Step 3 form submit ===');
            console.log('Form submit event:', e);
            console.log('Form values:', formik.values);
            console.log('Form errors:', formik.errors);
            console.log('Form touched:', formik.touched);
            console.log('Form is valid:', formik.isValid);
            formik.handleSubmit(e);
          }}>
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
              

              {/* Mật khẩu */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                  <InfoIcon sx={{ fontSize: 18, color: 'info.main', mt: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Mật khẩu phải có ít nhất 8 ký tự, tối đa 50 ký tự, bao gồm: chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)
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
                onClick={() => {
                  console.log('=== DEBUG: Nút "Hoàn thành đăng ký" được click ===');
                  console.log('Loading state:', loading);
                  console.log('Active step:', activeStep);
                  console.log('Form is valid:', formik.isValid);
                  console.log('Form errors:', formik.errors);
                  console.log('Form touched:', formik.touched);
                }}
              >
                Tiếp tục
              </Button>
            </Box>
          </Box>
        );
      case 4:
        return renderConfirmation();
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
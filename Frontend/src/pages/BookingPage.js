import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Paper,
  IconButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  Divider,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import axios from 'axios';
import { useSelector } from 'react-redux';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import BookingTransfusion from './BookingTransfusion';

const StyledTabs = styled(Tabs)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(0.5),
  minHeight: 'auto',
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  backgroundColor: 'transparent',
  color: theme.palette.text.secondary,
  borderRadius: theme.spacing(0.5),
  minHeight: 48,
  textTransform: 'none',
  fontWeight: 500,
  margin: theme.spacing(0, 0.5),
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  '&.completed': {
    backgroundColor: '#4caf50',
    color: 'white',
    '&:hover': {
      backgroundColor: '#45a049',
    },
  },
  '&.Mui-disabled': {
    opacity: 0.7,
  },
}));

const BloodTypeChip = styled(Chip)(({ theme }) => ({
  fontSize: '16px',
  fontWeight: 'bold',
  padding: theme.spacing(1, 2),
  cursor: 'default',
  transition: 'none',
}));

const TimeSlotButton = styled(Button)(({ theme, selected }) => ({
  padding: theme.spacing(1.5, 3),
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  fontWeight: 500,
  border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
  backgroundColor: selected ? theme.palette.primary.main : 'white',
  color: selected ? 'white' : theme.palette.text.primary,
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: selected ? theme.palette.primary.main : theme.palette.primary.light,
    color: selected ? 'white' : 'white',
  },
}));

const WeekCalendar = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
}));

const DayButton = styled(Button)(({ theme, selected }) => ({
  minWidth: 60,
  height: 60,
  borderRadius: theme.spacing(1),
  flexDirection: 'column',
  backgroundColor: selected ? theme.palette.primary.main : 'transparent',
  color: selected ? 'white' : theme.palette.text.primary,
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: selected ? theme.palette.primary.dark : theme.palette.primary.light,
    color: 'white',
  },
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  border: '1px solid #e0e0e0',
}));

const QuestionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  alignItems: 'flex-start',
  margin: theme.spacing(0.5, 0),
  '& .MuiFormControlLabel-label': {
    lineHeight: 1.5,
    marginTop: '2px',
    paddingLeft: theme.spacing(1),
  },
  '& .MuiCheckbox-root': {
    paddingTop: '6px',
    paddingBottom: '6px',
  },
}));

const OptionContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(1),
  '& .MuiTextField-root': {
    minWidth: 300,
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`booking-tabpanel-${index}`}
      aria-labelledby={`booking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const BookingPage = () => {
  const navigate = useNavigate();
  const userId = useSelector(state => state.auth.user?.userId);
  const [tabValue, setTabValue] = useState(0);
  const [donationDate, setDonationDate] = useState(null);
  const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 11:00');
  const [timeLocationCompleted, setTimeLocationCompleted] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [donationVolume, setDonationVolume] = useState(350);
  const [userWeight, setUserWeight] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [formData, setFormData] = useState({
    // Question 1
    '1.1': false, // Có
    '1.2': false, // Không

    // Question 2
    '2.1': false, // Có
    '2.1_detail': '',
    '2.2': false, // Không

    // Question 3
    '3.1': false, // Có
    '3.2': false, // Không
    '3.3': false, // Bệnh khác
    '3.3_detail': '',

    // Question 4
    '4.1': false,
    '4.2': false,
    '4.3': false,
    '4.3_detail': '',
    '4.4': false,

    // Question 5
    '5.1': false,
    '5.2': false,
    '5.3': false,
    '5.4': false,
    '5.5': false,
    '5.6': false,
    '5.7': false,
    '5.8': false,
    '5.9': false,
    '5.10': false,
    '5.11': false,

    // Question 6
    '6.1': false,
    '6.2': false,
    '6.3': false,

    // Question 7
    '7.1': false,
    '7.2': false,
    '7.3': false,
    '7.3_detail': '',

    // Question 8
    '8.1': false,
    '8.2': false,
    '8.3': false,
    '8.3_detail': '',

    // Question 9
    '9.1': false,
    '9.2': false,
    '9.3': false,
  });

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleContinue = () => {
    // Validation cho ngày hiến máu
    if (donationDate && selectedPeriod) {
      const selectedDate = dayjs(donationDate);
      const periodFrom = dayjs(selectedPeriod.periodDateFrom);
      const periodTo = dayjs(selectedPeriod.periodDateTo);
      
      if (selectedDate.isBefore(periodFrom, 'day') || selectedDate.isAfter(periodTo, 'day')) {
        alert('Ngày hiến máu phải nằm trong khoảng thời gian của đợt hiến máu!');
        return;
      }
    }
    
    setTimeLocationCompleted(true);
    setTabValue(1);
  };

  const handleBackToFirstTab = () => {
    setTimeLocationCompleted(false);
    setTabValue(0);
  };
  const handleSubmit = () => {
    // Kiểm tra validation trước khi cho phép submit
    const validationResult = validateFormData();
    if (validationResult) {
      setValidationError(validationResult);
      alert(validationResult);
      return;
    }
    setValidationError('');
    setOpenSummary(true);
  };

  const handlePeriodChange = (event) => {
    const periodId = event.target.value;
    const period = periods.find(p => p.periodId === periodId);
    setSelectedPeriod(period);
    setSelectedLocation(period ? period.location : '');
    setDonationDate(null); // Reset date when period changes
  };

  // Hàm kiểm tra validation cho phiếu khai báo y tế
  const validateFormData = () => {
    // Kiểm tra câu hỏi 1: Anh/chị từng hiến máu chưa?
    if (!formData['1.1'] && !formData['1.2']) {
      return 'Bạn chưa trả lời câu hỏi 1: Anh/chị từng hiến máu chưa?';
    }

    // Kiểm tra câu hỏi 2: Hiện tại, anh/chị có mắc bệnh lý nào không?
    if (!formData['2.1'] && !formData['2.2']) {
      return 'Bạn chưa trả lời câu hỏi 2: Hiện tại, anh/chị có mắc bệnh lý nào không?';
    }
    if (formData['2.1'] && !formData['2.1_detail'].trim()) {
      return 'Bạn đã chọn "Có" ở câu hỏi 2 nhưng chưa nhập chi tiết bệnh lý';
    }

    // Kiểm tra câu hỏi 3: Trước đây, anh/chị có từng mắc một trong các bệnh...
    if (!formData['3.1'] && !formData['3.2'] && !formData['3.3']) {
      return 'Bạn chưa trả lời câu hỏi 3: Trước đây, anh/chị có từng mắc một trong các bệnh...';
    }
    if (formData['3.3'] && !formData['3.3_detail'].trim()) {
      return 'Bạn đã chọn "Bệnh khác" ở câu hỏi 3 nhưng chưa nhập chi tiết';
    }

    // Kiểm tra câu hỏi 4: Trong 12 tháng gần đây, anh/chị có:
    if (!formData['4.1'] && !formData['4.2'] && !formData['4.3'] && !formData['4.4']) {
      return 'Bạn chưa trả lời câu hỏi 4: Trong 12 tháng gần đây, anh/chị có:';
    }
    if (formData['4.3'] && !formData['4.3_detail'].trim()) {
      return 'Bạn đã chọn "Khác" ở câu hỏi 4 nhưng chưa nhập chi tiết';
    }

    // Kiểm tra câu hỏi 5: Trong 06 tháng gần đây, anh/chị có:
    if (!formData['5.1'] && !formData['5.2'] && !formData['5.3'] && !formData['5.4'] && 
        !formData['5.5'] && !formData['5.6'] && !formData['5.7'] && !formData['5.8'] && 
        !formData['5.9'] && !formData['5.10'] && !formData['5.11']) {
      return 'Bạn chưa trả lời câu hỏi 5: Trong 06 tháng gần đây, anh/chị có:';
    }

    // Kiểm tra câu hỏi 6: Trong 01 tháng gần đây, anh/chị có:
    if (!formData['6.1'] && !formData['6.2'] && !formData['6.3']) {
      return 'Bạn chưa trả lời câu hỏi 6: Trong 01 tháng gần đây, anh/chị có:';
    }

    // Kiểm tra câu hỏi 7: Trong 14 ngày gần đây, anh/chị có:
    if (!formData['7.1'] && !formData['7.2'] && !formData['7.3']) {
      return 'Bạn chưa trả lời câu hỏi 7: Trong 14 ngày gần đây, anh/chị có:';
    }
    if (formData['7.3'] && !formData['7.3_detail'].trim()) {
      return 'Bạn đã chọn "Khác" ở câu hỏi 7 nhưng chưa nhập chi tiết';
    }

    // Kiểm tra câu hỏi 8: Trong 07 ngày gần đây, anh/chị có:
    if (!formData['8.1'] && !formData['8.2'] && !formData['8.3']) {
      return 'Bạn chưa trả lời câu hỏi 8: Trong 07 ngày gần đây, anh/chị có:';
    }
    if (formData['8.3'] && !formData['8.3_detail'].trim()) {
      return 'Bạn đã chọn "Khác" ở câu hỏi 8 nhưng chưa nhập chi tiết';
    }

    // Kiểm tra câu hỏi 9: Câu hỏi dành cho phụ nữ:
    if (!formData['9.1'] && !formData['9.2'] && !formData['9.3']) {
      return 'Bạn chưa trả lời câu hỏi 9: Câu hỏi dành cho phụ nữ:';
    }

    return null; // Không có lỗi
  };

  // Thêm hàm tổng hợp PatientCondition từ formData
  function buildPatientCondition(formData) {
    let result = [];
    // 1. Hiến máu chưa
    if (formData['1.1']) result.push('Đã từng hiến máu');
    if (formData['1.2']) result.push('Chưa từng hiến máu');
    // 2. Bệnh lý
    if (formData['2.1']) result.push('Có bệnh lý' + (formData['2.1_detail'] ? ` (${formData['2.1_detail']})` : ''));
    if (formData['2.2']) result.push('Không có bệnh lý');
    // 3. Bệnh truyền nhiễm
    if (formData['3.1']) result.push('Từng mắc bệnh truyền nhiễm');
    if (formData['3.2']) result.push('Không mắc bệnh truyền nhiễm');
    if (formData['3.3']) result.push('Bệnh khác' + (formData['3.3_detail'] ? ` (${formData['3.3_detail']})` : ''));
    // 4. 12 tháng gần đây
    if (formData['4.1']) result.push('Có truyền máu/tiêm chích');
    if (formData['4.2']) result.push('Có phẫu thuật');
    if (formData['4.3']) result.push('Khác' + (formData['4.3_detail'] ? ` (${formData['4.3_detail']})` : ''));
    if (formData['4.4']) result.push('Không');
    // 5. 6 tháng gần đây
    for (let i = 1; i <= 10; i++) {
      if (formData[`5.${i}`]) result.push(`5.${i}`);
    }
    if (formData['5.11']) result.push('Không (6 tháng gần đây)');
    // 6. 1 tháng gần đây
    if (formData['6.1']) result.push('Khỏi bệnh sau viêm nhiễm');
    if (formData['6.2']) result.push('Đi vùng dịch');
    if (formData['6.3']) result.push('Không (1 tháng gần đây)');
    // 7. 14 ngày gần đây
    if (formData['7.1']) result.push('Bị cúm/cảm/sốt/đau họng');
    if (formData['7.2']) result.push('Không (14 ngày gần đây)');
    if (formData['7.3']) result.push('Khác (14 ngày gần đây)' + (formData['7.3_detail'] ? ` (${formData['7.3_detail']})` : ''));
    // 8. 7 ngày gần đây
    if (formData['8.1']) result.push('Dùng thuốc kháng sinh/kháng viêm');
    if (formData['8.2']) result.push('Không (7 ngày gần đây)');
    if (formData['8.3']) result.push('Khác (7 ngày gần đây)' + (formData['8.3_detail'] ? ` (${formData['8.3_detail']})` : ''));
    // 9. Phụ nữ
    if (formData['9.1']) result.push('Đang mang thai/nuôi con nhỏ');
    if (formData['9.2']) result.push('Chấm dứt thai kỳ 12 tháng gần đây');
    if (formData['9.3']) result.push('Không (phụ nữ)');
    return result.join('; ');
  }

  // Thêm hàm gọi API đăng ký hiến máu
  const handleRegisterDonation = async () => {
    try {
      if (!userId) {
        setSnackbar({ open: true, message: 'Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại!', severity: 'error' });
        return;
      }
      const periodId = selectedPeriod ? selectedPeriod.periodId : null;
      const componentId = 1; // ComponentId, cần lấy từ loại máu thực tế
      const responsibleById = 1; // Id của staff/admin phụ trách, tạm thời hardcode
      const patientCondition = buildPatientCondition(formData); // tổng hợp từ form
      const requestDate = new Date().toISOString();
      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({ open: true, message: 'Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn!', severity: 'error' });
        return;
      }
      const payload = {
        donationId: 0, // để backend tự sinh
        memberId: userId,
        periodId: periodId,
        componentId: componentId,
        preferredDonationDate: donationDate ? dayjs(donationDate).format('YYYY-MM-DD') : null, // Sử dụng ngày đã chọn
        responsibleById: responsibleById,
        requestDate: requestDate,
        approvalDate: null,
        donationVolume: donationVolume,
        status: 'Approved',
        notes: `Địa điểm hiến máu: ${selectedPeriod ? selectedPeriod.location : 'Chưa chọn'}. Khung giờ: ${selectedTimeSlot}`,
        patientCondition: patientCondition
      };
      const response = await axios.post('/api/DonationRequest', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.status === 200 || response.status === 201) {
        setSnackbar({ open: true, message: 'Đăng ký của bạn đã được gửi thành công!', severity: 'success' });
        setTimeout(() => {
          navigate('/', { replace: true });
          window.scrollTo(0, 0);
        }, 1500);
      } else {
        setSnackbar({ open: true, message: 'Có lỗi xảy ra khi đăng ký!', severity: 'error' });
      }
    } catch (error) {
      let msg = 'Lỗi kết nối server hoặc thiếu thông tin!';
      if (error.response && error.response.data) {
        if (typeof error.response.data === 'object' && error.response.data.message) {
          msg = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          msg = error.response.data;
        }
      }
      setSnackbar({ open: true, message: msg, severity: 'error' });
    }
  };

  const handleCheckboxChange = (name) => (event) => {
    const isChecked = event.target.checked;

    // Handle single choice questions (Yes/No only)
    if (['1.1', '1.2'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        '1.1': name === '1.1' ? isChecked : false,
        '1.2': name === '1.2' ? isChecked : false,
      }));
    }
    else if (['2.1', '2.2'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        '2.1': name === '2.1' ? isChecked : false,
        '2.2': name === '2.2' ? isChecked : false,
        '2.1_detail': name === '2.1' ? prev['2.1_detail'] : '',
      }));
    }
    else if (['3.1', '3.2', '3.3'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        '3.1': name === '3.1' ? isChecked : false,
        '3.2': name === '3.2' ? isChecked : false,
        '3.3': name === '3.3' ? isChecked : false,
        '3.3_detail': name === '3.3' ? prev['3.3_detail'] : '',
      }));
    }
    else if (['7.1', '7.2', '7.3'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        '7.1': name === '7.1' ? isChecked : false,
        '7.2': name === '7.2' ? isChecked : false,
        '7.3': name === '7.3' ? isChecked : false,
        '7.3_detail': name === '7.3' ? prev['7.3_detail'] : '',
      }));
    }
    else if (['8.1', '8.2', '8.3'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        '8.1': name === '8.1' ? isChecked : false,
        '8.2': name === '8.2' ? isChecked : false,
        '8.3': name === '8.3' ? isChecked : false,
        '8.3_detail': name === '8.3' ? prev['8.3_detail'] : '',
      }));
    }
    else if (name.startsWith('4.')) {
      if (name === '4.4' && isChecked) {
        // If "Không" is selected, uncheck all others
        setFormData(prev => ({
          ...prev,
          '4.1': false,
          '4.2': false,
          '4.3': false,
          '4.3_detail': '',
          '4.4': true,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isChecked,
          '4.4': name !== '4.4' && isChecked ? false : prev['4.4'], // Uncheck "Không" if any other option is selected
        }));
      }
    }
    else if (name.startsWith('5.')) {
      if (name === '5.11' && isChecked) {
        // If "Không" is selected, uncheck all others
        setFormData(prev => ({
          ...prev,
          '5.1': false,
          '5.2': false,
          '5.3': false,
          '5.4': false,
          '5.5': false,
          '5.6': false,
          '5.7': false,
          '5.8': false,
          '5.9': false,
          '5.10': false,
          '5.11': true,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isChecked,
          '5.11': name !== '5.11' && isChecked ? false : prev['5.11'], // Uncheck "Không" if any other option is selected
        }));
      }
    }
    else if (name.startsWith('6.')) {
      if (name === '6.3' && isChecked) {
        // If "Không" is selected, uncheck all others
        setFormData(prev => ({
          ...prev,
          '6.1': false,
          '6.2': false,
          '6.3': true,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isChecked,
          '6.3': name !== '6.3' && isChecked ? false : prev['6.3'], // Uncheck "Không" if any other option is selected
        }));
      }
    }
    else if (name.startsWith('9.')) {
      if (name === '9.3' && isChecked) {
        // If "Không" is selected, uncheck all others
        setFormData(prev => ({
          ...prev,
          '9.1': false,
          '9.2': false,
          '9.3': true,
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          [name]: isChecked,
          '9.3': name !== '9.3' && isChecked ? false : prev['9.3'], // Uncheck "Không" if any other option is selected
        }));
      }
    }
    else {
      setFormData(prev => ({
        ...prev,
        [name]: isChecked
      }));
    }
  };

  const handleTextFieldChange = (name) => (event) => {
    setFormData(prev => ({
      ...prev,
      [name]: event.target.value
    }));
  };

  const bloodTypes = [
    { type: 'A', color: '#17a2b8' },
    { type: 'B', color: '#ffc107' },
    { type: 'AB', color: '#dc3545' },
    { type: 'O', color: '#28a745' },
  ];

  const cities = [
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Nẵng',
    'Cần Thơ',
    'Nha Trang',
  ];

  const timeSlots = [
    '07:00 - 11:00',
    '13:00 - 16:00',
  ];

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get('/api/BloodDonationPeriod', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      setPeriods(res.data);
    })
    .catch(() => {
      setPeriods([]);
      setSelectedPeriod(null);
    });
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('selectedPeriodInfo');
    if (stored) {
      const info = JSON.parse(stored);
      if (info.period) {
        setSelectedPeriod(info.period);
        setSelectedLocation(info.period.location);
      }
      if (info.fromDate) setFromDate(dayjs(info.fromDate));
      if (info.toDate) setToDate(dayjs(info.toDate));
      localStorage.removeItem('selectedPeriodInfo');
    }
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      const start = dayjs(selectedPeriod.periodDateFrom);
      const end = dayjs(selectedPeriod.periodDateTo);
      const dates = [];
      let currentDate = start;
      while (currentDate.isBefore(end) || currentDate.isSame(end)) {
        dates.push(currentDate);
        currentDate = currentDate.add(1, 'day');
      }
      setAvailableDates(dates);
    } else {
      setAvailableDates([]);
    }
    setDonationDate(null); // Reset ngày đã chọn khi đổi đợt
  }, [selectedPeriod]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.get('/api/User/profile', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        console.log('User profile API response:', res.data); // log dữ liệu trả về
        const userData = Array.isArray(res.data) ? res.data[0] : res.data;
        if (userData && userData.weight) {
          setUserWeight(userData.weight);
        } else {
          setUserWeight(null);
        }
      }).catch(err => {
        setUserWeight(null);
        console.error('Lỗi lấy thông tin cân nặng:', err);
      });
    } else {
      setUserWeight(null);
    }
  }, []);

  useEffect(() => {
    if (userWeight) {
      if (userWeight <= 50) setDonationVolume(250);
      else if (userWeight > 50 && userWeight <= 60) setDonationVolume(350);
      else if (userWeight > 60) setDonationVolume(450);
    } else {
      setDonationVolume(350);
    }
  }, [userWeight]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
          Đặt lịch hiến máu
        </Typography>

        <Grid container spacing={4}>
          {/* Left Sidebar - Tabs */}
          <Grid item xs={12} md={3}>
            <StyledTabs
              orientation="vertical"
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
            >
              <StyledTab
                icon={timeLocationCompleted ? <CheckCircleIcon /> : <CalendarTodayIcon />}
                label="Thời gian & địa điểm"
                iconPosition="start"
                className={timeLocationCompleted ? 'completed' : ''}
                disabled={timeLocationCompleted}
              />
              <StyledTab
                icon={<BloodtypeIcon />}
                label="Phiếu đăng ký hiến máu"
                iconPosition="start"
              />
            </StyledTabs>
          </Grid>

          {/* Right Content */}
          <Grid item xs={12} md={9}>
            <TabPanel value={tabValue} index={0}>
              {/* Time & Location Tab Content */}
              <Stack spacing={4}>
                {/* Location Selection */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn đợt hiến máu
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ mb: 2, color: '#e53935', fontStyle: 'italic', display: 'flex', alignItems: 'center', fontWeight: 500 }}>
                      <WarningIcon sx={{ fontSize: 20, mr: 1, color: '#e53935' }} />
                      Vui lòng chọn ngày hiện tại để xem các đợt hiến máu phù hợp.
                    </Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <DatePicker
                          label="Từ ngày"
                          value={fromDate}
                          onChange={setFromDate}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          maxDate={toDate}
                        />
                        <DatePicker
                          label="Đến ngày"
                          value={toDate}
                          onChange={setToDate}
                          renderInput={(params) => <TextField {...params} size="small" fullWidth />}
                          minDate={fromDate}
                        />
                      </Box>
                    </FormControl>
                    <FormControl fullWidth>
                      <InputLabel>Chọn đợt hiến máu</InputLabel>
                      <Select
                        value={selectedPeriod ? selectedPeriod.periodId : ''}
                        onChange={handlePeriodChange}
                        label="Chọn đợt hiến máu"
                        MenuProps={{
                          PaperProps: {
                            style: {
                              maxHeight: 300,
                            },
                          },
                        }}
                        disabled={!fromDate || !toDate}
                      >
                        {fromDate && toDate && periods
                          .filter(period => {
                            const from = dayjs(fromDate).startOf('day');
                            const to = dayjs(toDate).endOf('day');
                            const periodFrom = dayjs(period.periodDateFrom);
                            const periodTo = dayjs(period.periodDateTo);
                            return periodTo.isSameOrAfter(from) && periodFrom.isSameOrBefore(to);
                          })
                          .map((period) => (
                            <MenuItem key={period.periodId} value={period.periodId}>
                              <Box>
                                <Typography variant="body1" fontWeight="bold">
                                  {period.periodName}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {period.location}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {dayjs(period.periodDateFrom).format('DD/MM/YYYY')} - {dayjs(period.periodDateTo).format('DD/MM/YYYY')}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        {(!fromDate || !toDate) && (
                          <MenuItem disabled>Vui lòng chọn khoảng ngày trước.</MenuItem>
                        )}
                        {fromDate && toDate && periods.length === 0 && (
                          <MenuItem disabled>Không có đợt hiến máu nào đang diễn ra.</MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </CardContent>
                </Card>

                {/* Date and Hospital Selection */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn ngày hiến máu và địa điểm
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Vui lòng chọn ngày hiến máu và địa điểm bệnh viện phù hợp với lịch trình của bạn.
                    </Typography>
                    
                    {selectedPeriod && (
                      <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                          <strong>Khoảng thời gian hiến máu:</strong> Từ {dayjs(selectedPeriod.periodDateFrom).format('DD/MM/YYYY')} đến {dayjs(selectedPeriod.periodDateTo).format('DD/MM/YYYY')}
                        </Typography>
                      </Alert>
                    )}
                    
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Ngày hiến máu</InputLabel>
                          <Select
                            value={donationDate ? dayjs(donationDate).format('DD/MM/YYYY') : ''}
                            onChange={(e) => setDonationDate(dayjs(e.target.value, 'DD/MM/YYYY'))}
                            label="Ngày hiến máu"
                            disabled={!selectedPeriod}
                          >
                            {availableDates.map((date) => (
                              <MenuItem key={date.toString()} value={date.format('DD/MM/YYYY')}>
                                {date.format('DD/MM/YYYY')}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Blood Type Information */}
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                      Nhóm máu cần hiến
                    </Typography>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Các nhóm máu đang có nhu cầu hiến máu cao tại địa điểm này:
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                      {bloodTypes.map((blood) => (
                        <BloodTypeChip
                          key={blood.type}
                          label={`Nhóm máu ${blood.type}`}
                          sx={{
                            backgroundColor: blood.color,
                            color: 'white',
                          }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>

                {/* Lượng máu muốn hiến */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <BloodtypeIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn lượng máu bạn muốn hiến
                      </Typography>
                    </Box>
                    <FormControl fullWidth>
                      <InputLabel>Lượng máu muốn hiến</InputLabel>
                      <Select
                        value={donationVolume}
                        onChange={(e) => setDonationVolume(e.target.value)}
                        label="Lượng máu muốn hiến"
                      >
                        <MenuItem value={250}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <span>250 ml</span>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {userWeight && userWeight <= 50 ? "(Khuyến nghị)" : ""}
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value={350}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <span>350 ml</span>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {userWeight && userWeight > 50 && userWeight <= 60 ? "(Khuyến nghị)" : ""}
                            </Typography>
                          </Box>
                        </MenuItem>
                        <MenuItem value={450}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                            <span>450 ml</span>
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                              {userWeight && userWeight > 60 ? "(Khuyến nghị)" : ""}
                            </Typography>
                          </Box>
                        </MenuItem>
                      </Select>
                      {userWeight && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Cân nặng hiện tại của bạn: {userWeight} kg
                        </Typography>
                      )}
                      {userWeight === null && (
                        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                          Không lấy được cân nặng từ hồ sơ. Vui lòng cập nhật cân nặng trong tài khoản để nhận khuyến nghị!
                        </Typography>
                      )}
                    </FormControl>
                  </CardContent>
                </Card>

                {/* Time Slot Selection */}
                {/*
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <AccessTimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn khung giờ bạn sẽ đến hiến máu
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Thời gian nhận hồ sơ
                    </Typography>
                    <Stack direction="row" spacing={2}>
                      {timeSlots.map((slot) => (
                        <TimeSlotButton
                          key={slot}
                          selected={selectedTimeSlot === slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                        >
                          {slot}
                        </TimeSlotButton>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
                */}

                {/* Continue Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleContinue}
                    disabled={!selectedPeriod || !donationDate}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Tiếp tục
                  </Button>
                </Box>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {/* Blood Donation Form Tab Content */}
              <Stack spacing={3}>
                <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
                  Phiếu đăng ký hiến máu
                </Typography>

                {/* Hiển thị thông báo lỗi validation */}
                {validationError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      {validationError}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Vui lòng hoàn thành tất cả các câu hỏi trước khi tiếp tục.
                    </Typography>
                  </Alert>
                )}

                {/* Question 1 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>1. Anh/chị từng hiến máu chưa?</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['1.1']} onChange={handleCheckboxChange('1.1')} />}
                        label="Có"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['1.2']} onChange={handleCheckboxChange('1.2')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 2 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>2. Hiện tại, anh/ chị có mắc bệnh lý nào không?</QuestionTitle>
                    <FormGroup>
                      <OptionContainer>
                        <StyledFormControlLabel
                          control={<Checkbox checked={formData['2.1']} onChange={handleCheckboxChange('2.1')} />}
                          label="Có"
                        />
                        <TextField
                          size="small"
                          disabled={!formData['2.1']}
                          value={formData['2.1_detail']}
                          onChange={handleTextFieldChange('2.1_detail')}
                          placeholder="Chi tiết bệnh lý"
                        />
                      </OptionContainer>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['2.2']} onChange={handleCheckboxChange('2.2')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 3 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>
                      3. Trước đây, anh/chị có từng mắc một trong các bệnh: viêm gan siêu vi B, C, HIV, vảy nến,
                      phì đại tiền liệt tuyến, sốc phản vệ, tai biến mạch máu não, nhồi máu cơ tim, lupus ban đỏ,
                      động kinh, ung thư, hen, được cấy ghép mô tạng?
                    </QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['3.1']} onChange={handleCheckboxChange('3.1')} />}
                        label="Có"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['3.2']} onChange={handleCheckboxChange('3.2')} />}
                        label="Không"
                      />
                      <OptionContainer>
                        <StyledFormControlLabel
                          control={<Checkbox checked={formData['3.3']} onChange={handleCheckboxChange('3.3')} />}
                          label="Bệnh khác"
                        />
                        <TextField
                          size="small"
                          disabled={!formData['3.3']}
                          value={formData['3.3_detail']}
                          onChange={handleTextFieldChange('3.3_detail')}
                          placeholder="Chi tiết bệnh khác"
                        />
                      </OptionContainer>
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 4 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>4. Trong 12 tháng gần đây, anh/chị có:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['4.1']} onChange={handleCheckboxChange('4.1')} />}
                        label="Khỏi bệnh sau khi mắc một trong các bệnh: sốt rét, giang mai, lao, viêm não-màng não, uốn ván, phẫu thuật ngoại khoa?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['4.2']} onChange={handleCheckboxChange('4.2')} />}
                        label="Được truyền máu hoặc các chế phẩm máu?"
                      />
                      <OptionContainer>
                        <StyledFormControlLabel
                          control={<Checkbox checked={formData['4.3']} onChange={handleCheckboxChange('4.3')} />}
                          label="Tiêm Vacxin?"
                        />
                        <TextField
                          size="small"
                          disabled={!formData['4.3']}
                          value={formData['4.3_detail']}
                          onChange={handleTextFieldChange('4.3_detail')}
                          placeholder="Loại vacxin"
                        />
                      </OptionContainer>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['4.4']} onChange={handleCheckboxChange('4.4')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 5 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>5. Trong 06 tháng gần đây, anh/chị có:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.1']} onChange={handleCheckboxChange('5.1')} />}
                        label="Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tủy, viêm tủy xương?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.2']} onChange={handleCheckboxChange('5.2')} />}
                        label="Sút cân nhanh không rõ nguyên nhân?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.3']} onChange={handleCheckboxChange('5.3')} />}
                        label="Nổi hạch kéo dài?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.4']} onChange={handleCheckboxChange('5.4')} />}
                        label="Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi,…)?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.5']} onChange={handleCheckboxChange('5.5')} />}
                        label="Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.6']} onChange={handleCheckboxChange('5.6')} />}
                        label="Sử dụng ma túy?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.7']} onChange={handleCheckboxChange('5.7')} />}
                        label="Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.8']} onChange={handleCheckboxChange('5.8')} />}
                        label="Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.9']} onChange={handleCheckboxChange('5.9')} />}
                        label="Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.10']} onChange={handleCheckboxChange('5.10')} />}
                        label="Quan hệ tình dục với người cùng giới?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['5.11']} onChange={handleCheckboxChange('5.11')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 6 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>6. Trong 01 tháng gần đây, anh/chị có:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['6.1']} onChange={handleCheckboxChange('6.1')} />}
                        label="Khỏi bệnh sau khi mắc bệnh viêm đường tiết niệu, viêm da nhiễm trùng, viêm phế quản, viêm phổi, sởi, ho gà, quai bị, sốt xuất huyết, kiết lỵ, tả, Rubella?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['6.2']} onChange={handleCheckboxChange('6.2')} />}
                        label="Đi vào vùng có dịch bệnh lưu hành (sốt rét, sốt xuất huyết, Zika,…)?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['6.3']} onChange={handleCheckboxChange('6.3')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 7 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>7. Trong 14 ngày gần đây, anh/chị có:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['7.1']} onChange={handleCheckboxChange('7.1')} />}
                        label="Bị cúm, cảm lạnh, ho, nhức đầu, sốt, đau họng?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['7.2']} onChange={handleCheckboxChange('7.2')} />}
                        label="Không"
                      />
                      <OptionContainer>
                        <StyledFormControlLabel
                          control={<Checkbox checked={formData['7.3']} onChange={handleCheckboxChange('7.3')} />}
                          label="Khác (cụ thể)"
                        />
                        <TextField
                          size="small"
                          disabled={!formData['7.3']}
                          value={formData['7.3_detail']}
                          onChange={handleTextFieldChange('7.3_detail')}
                          placeholder="Chi tiết"
                        />
                      </OptionContainer>
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 8 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>8. Trong 07 ngày gần đây, anh/chị có:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['8.1']} onChange={handleCheckboxChange('8.1')} />}
                        label="Dùng thuốc kháng sinh, kháng viêm, Aspirin, Corticoid?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['8.2']} onChange={handleCheckboxChange('8.2')} />}
                        label="Không"
                      />
                      <OptionContainer>
                        <StyledFormControlLabel
                          control={<Checkbox checked={formData['8.3']} onChange={handleCheckboxChange('8.3')} />}
                          label="Khác (cụ thể)"
                        />
                        <TextField
                          size="small"
                          disabled={!formData['8.3']}
                          value={formData['8.3_detail']}
                          onChange={handleTextFieldChange('8.3_detail')}
                          placeholder="Chi tiết"
                        />
                      </OptionContainer>
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Question 9 */}
                <QuestionCard>
                  <CardContent>
                    <QuestionTitle>9. Câu hỏi dành cho phụ nữ:</QuestionTitle>
                    <FormGroup>
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['9.1']} onChange={handleCheckboxChange('9.1')} />}
                        label="Hiện chị đang mang thai hoặc nuôi con dưới 12 tháng tuổi?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['9.2']} onChange={handleCheckboxChange('9.2')} />}
                        label="Chấm dứt thai kỳ trong 12 tháng gần đây (sảy thai, phá thai, thai ngoài tử cung)?"
                      />
                      <StyledFormControlLabel
                        control={<Checkbox checked={formData['9.3']} onChange={handleCheckboxChange('9.3')} />}
                        label="Không"
                      />
                    </FormGroup>
                  </CardContent>
                </QuestionCard>

                {/* Submit Button */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleBackToFirstTab}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Quay lại
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{ px: 4, py: 1.5 }}
                    onClick={handleSubmit}
                  >
                    Hoàn thành đăng ký
                  </Button>

                </Box>
              </Stack>
            </TabPanel>
          </Grid>
        </Grid>
      </Container>
      <Dialog open={openSummary} onClose={() => setOpenSummary(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight="bold" color="primary.main">
          Xác nhận thông tin đăng ký hiến máu
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Typography variant="subtitle1">
              <strong>Đợt hiến máu:</strong> {selectedPeriod ? selectedPeriod.periodName : 'Chưa chọn'}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Ngày hiến máu:</strong> {donationDate ? dayjs(donationDate).format('DD/MM/YYYY') : 'Chưa chọn'}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Khung giờ:</strong> {selectedTimeSlot}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Địa điểm hiến máu:</strong> {selectedPeriod ? selectedPeriod.location : 'Chưa chọn'}
            </Typography>

            <Divider />

            <Typography variant="h6" fontWeight="bold" color="primary.main">
              Phiếu khảo sát đã chọn:
            </Typography>
            <Box>
              <Typography fontWeight="bold" color="primary.main">
                1. Anh/chị từng hiến máu chưa?
              </Typography>
              <Typography pl={2}>
                {formData['1.1'] && '- Có'}
                {formData['1.2'] && '- Không'}
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                2. Hiện tại, anh/ chị có mắc bệnh lý nào không?
              </Typography>
              <Stack pl={2}>
                {formData['2.1'] && (
                  <Typography>- Có</Typography>
                )}
                {formData['2.1_detail'] && (
                  <Typography>+ Chi tiết: {formData['2.1_detail']}</Typography>
                )}
                {formData['2.2'] && <Typography>- Không</Typography>}
              </Stack>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                3. Trước đây, anh/chị có từng mắc một trong các bệnh...
              </Typography>
              <Stack pl={2}>
                {formData['3.1'] && <Typography>- Có</Typography>}
                {formData['3.2'] && <Typography>- Không</Typography>}
                {formData['3.3'] && <Typography>- Bệnh khác</Typography>}
                {formData['3.3_detail'] && (
                  <Typography>+ Chi tiết: {formData['3.3_detail']}</Typography>
                )}
              </Stack>
            </Box>


            <Box>
              <Typography fontWeight="bold" color="primary.main">
                4. Trong 12 tháng gần đây, anh/chị có:
              </Typography>
              <Typography pl={2}>
                {formData['1.1'] && '- Có'}
                {formData['1.2'] && '- Không'}
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                5. Trong 06 tháng gần đây, anh/chị có:
              </Typography>
              <Stack pl={2}>
                {formData['2.1'] && (
                  <Typography>- Có</Typography>
                )}
                {formData['2.1_detail'] && (
                  <Typography>+ Chi tiết: {formData['2.1_detail']}</Typography>
                )}
                {formData['2.2'] && <Typography>- Không</Typography>}
              </Stack>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                6. Trong 01 tháng gần đây, anh/chị có:
              </Typography>
              <Stack pl={2}>
                {formData['3.1'] && <Typography>- Có</Typography>}
                {formData['3.2'] && <Typography>- Không</Typography>}
                {formData['3.3'] && <Typography>- Bệnh khác</Typography>}
                {formData['3.3_detail'] && (
                  <Typography>+ Chi tiết: {formData['3.3_detail']}</Typography>
                )}
              </Stack>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                7. Trong 14 ngày gần đây, anh/chị có:
              </Typography>
              <Typography pl={2}>
                {formData['1.1'] && '- Có'}
                {formData['1.2'] && '- Không'}
              </Typography>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                8. Trong 07 ngày gần đây, anh/chị có:
              </Typography>
              <Stack pl={2}>
                {formData['2.1'] && (
                  <Typography>- Có</Typography>
                )}
                {formData['2.1_detail'] && (
                  <Typography>+ Chi tiết: {formData['2.1_detail']}</Typography>
                )}
                {formData['2.2'] && <Typography>- Không</Typography>}
              </Stack>
            </Box>

            <Box>
              <Typography fontWeight="bold" color="primary.main">
                9. Câu hỏi dành cho phụ nữ:
              </Typography>
              <Stack pl={2}>
                {formData['3.1'] && <Typography>- Có</Typography>}
                {formData['3.2'] && <Typography>- Không</Typography>}
                {formData['3.3'] && <Typography>- Bệnh khác</Typography>}
                {formData['3.3_detail'] && (
                  <Typography>+ Chi tiết: {formData['3.3_detail']}</Typography>
                )}
              </Stack>
            </Box>





          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSummary(false)}>Quay lại</Button>
          <Button
            variant="contained"
            onClick={async () => {
              setOpenSummary(false);
              await handleRegisterDonation();
            }}
          >
            Xác nhận gửi
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </LocalizationProvider>
  );
};

export default BookingPage; 
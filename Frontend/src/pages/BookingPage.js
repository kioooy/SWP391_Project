import React, { useState } from 'react';
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
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import dayjs from 'dayjs';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  const [tabValue, setTabValue] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs().add(1, 'day'));
  const [selectedCity, setSelectedCity] = useState('Hồ Chí Minh');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('07:00 - 11:00');
  const [currentWeek, setCurrentWeek] = useState(dayjs().startOf('week'));
  const [timeLocationCompleted, setTimeLocationCompleted] = useState(false);
  const [openSummary, setOpenSummary] = useState(false);
  const [openCalendarDialog, setOpenCalendarDialog] = useState(false);

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
    setTimeLocationCompleted(true);
    setTabValue(1);
  };

  const handleBackToFirstTab = () => {
    setTimeLocationCompleted(false);
    setTabValue(0);
  };
  const handleSubmit = () => {
    setOpenSummary(true);
  };
  const handleViewCalendar = () => {
    setOpenCalendarDialog(true);
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
    // Handle multiple choice questions with "Không" logic
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

  const locations = [
    'Hiến máu - Trung Tâm Hiến Máu Nhân Đạo Tp.HCM',
    'Hiến máu - 466 Nguyễn Thị Minh Khai',
    'Hiến máu - Bệnh viện Chợ Rẫy',
    'Hiến máu - Bệnh viện Bình Dân',
  ];

  const timeSlots = [
    '07:00 - 11:00',
    '13:00 - 16:00',
  ];

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      days.push(currentWeek.add(i, 'day'));
    }
    return days;
  };

  const weekDays = getWeekDays();
  const weekDayLabels = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <>
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
                {/* Date Selection */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <CalendarTodayIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn ngày - {selectedDate.format('DD/MM/YYYY')}
                      </Typography>

                      <Button size="small" sx={{ ml: 'auto' }} onClick={handleViewCalendar}>
                        Xem lịch
                      </Button>
    
                    </Box>

                    <WeekCalendar elevation={0} sx={{ border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <IconButton onClick={() => setCurrentWeek(currentWeek.subtract(1, 'week'))}>
                          <ChevronLeftIcon />
                        </IconButton>
                        <Box sx={{ display: 'flex', gap: 1, flex: 1, justifyContent: 'center' }}>
                          {weekDays.map((day, index) => (
                            <DayButton
                              key={index}
                              selected={day.isSame(selectedDate, 'day')}
                              onClick={() => setSelectedDate(day)}
                            >
                              <Typography variant="caption" sx={{ mb: 0.5 }}>
                                {weekDayLabels[index]}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {day.format('D')}
                              </Typography>
                            </DayButton>
                          ))}
                        </Box>
                        <IconButton onClick={() => setCurrentWeek(currentWeek.add(1, 'week'))}>
                          <ChevronRightIcon />
                        </IconButton>
                      </Box>
                    </WeekCalendar>
                  </CardContent>
                </Card>

                {/* Location Selection */}
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <LocationOnIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" fontWeight="bold">
                        Chọn địa điểm hiến máu
                      </Typography>
                    </Box>

                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Tỉnh/Thành phố</InputLabel>
                          <Select
                            value={selectedCity}
                            label="Tỉnh/Thành phố"
                            onChange={(e) => setSelectedCity(e.target.value)}
                          >
                            {cities.map((city) => (
                              <MenuItem key={city} value={city}>
                                {city}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>

                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Địa điểm</InputLabel>
                          <Select
                            value={selectedLocation}
                            label="Địa điểm"
                            onChange={(e) => setSelectedLocation(e.target.value)}
                          >
                            {locations.map((location) => (
                              <MenuItem key={location} value={location}>
                                <Box>
                                  <Typography variant="body2" color="primary" fontWeight="bold">
                                    {location}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    106 Thiên Phước, Phường 9, Quận Tân Bình, TP.HCM
                                  </Typography>
                                </Box>
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

                {/* Time Slot Selection */}
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

                {/* Continue Button */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleContinue}
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
                        label="Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tụy, viêm tủy xương?"
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
              <strong>Ngày hiến máu:</strong> {selectedDate.format('DD/MM/YYYY')}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Khung giờ:</strong> {selectedTimeSlot}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Tỉnh/Thành phố:</strong> {selectedCity}
            </Typography>
            <Typography variant="subtitle1">
              <strong>Địa điểm:</strong> {selectedLocation || 'Chưa chọn'}
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
            onClick={() => {
              setOpenSummary(false);
              alert('Đăng ký của bạn đã được gửi!');
              // Gửi form tại đây nếu cần
            }}
          >
            Xác nhận gửi
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCalendarDialog} onClose={() => setOpenCalendarDialog(false)}>
        <DialogTitle>Chọn ngày hiến máu</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Ngày hiến máu"
              value={selectedDate}
              onChange={(newValue) => {
                setSelectedDate(newValue);
              }}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCalendarDialog(false)}>Hủy</Button>
          <Button
            onClick={() => setOpenCalendarDialog(false)}
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>


    </>

  );
};

export default BookingPage; 
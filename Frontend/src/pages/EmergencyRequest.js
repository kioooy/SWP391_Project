import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
} from '@mui/material';
import {
  Bloodtype,
  LocalHospital,
  Person,
  Phone,
  Email,
  LocationOn,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';




const EmergencyRequest = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    patientName: '',
    bloodType: '',
    quantity: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    reason: '',
    notes: '',
    cccd: '',
  });








  const [errors, setErrors] = useState({});




  const steps = ['Thông tin cơ bản', 'Thông tin liên hệ', 'Xác nhận'];




  const bloodTypes = [
    { id: 1, name: 'A+' },
    { id: 2, name: 'A-' },
    { id: 3, name: 'B+' },
    { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' },
    { id: 6, name: 'AB-' },
    { id: 7, name: 'O+' },
    { id: 8, name: 'O-' },
    { id: 99, name: 'Không rõ' },
  ];








  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });




  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
    // Xóa lỗi khi người dùng thay đổi giá trị
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: '',
      });
    }
  };




  const handlePatientNameChange = (event) => {
    // Chỉ loại bỏ số và các ký tự đặc biệt, giữ lại mọi chữ cái và dấu
    const value = event.target.value.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~`]/g, '');
    setFormData({
      ...formData,
      patientName: value,
    });
    if (errors.patientName) {
      setErrors({ ...errors, patientName: '' });
    }
  };




  const handleReasonChange = (event) => {
    // Chỉ loại bỏ số và các ký tự đặc biệt, giữ lại mọi chữ cái và dấu
    const value = event.target.value.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~`]/g, '');
    setFormData({
      ...formData,
      reason: value,
    });
  };




  const handleContactNameChange = (event) => {
    // Chỉ loại bỏ số và các ký tự đặc biệt, giữ lại mọi chữ cái và dấu
    const value = event.target.value.replace(/[0-9!@#$%^&*()_+={}\[\]:;"'<>,.?/\\|~`]/g, '');
    setFormData({
      ...formData,
      contactName: value,
    });
    if (errors.contactName) {
      setErrors({ ...errors, contactName: '' });
    }
  };




  const handleContactPhoneChange = (event) => {
    let value = event.target.value.replace(/[^0-9]/g, '').slice(0, 10); // chỉ cho nhập tối đa 10 số
    setFormData({
      ...formData,
      contactPhone: value,
    });
    if (errors.contactPhone) {
      setErrors({ ...errors, contactPhone: '' });
    }
  };




  const handleLocationChange = (event) => {
    // Cho phép chữ cái, số, dấu cách, ký tự tiếng Việt và các ký tự đặc biệt: / , .
    const value = event.target.value.replace(/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\/,.]/g, '');
    setFormData({
      ...formData,
      location: value,
    });
    if (errors.location) {
      setErrors({ ...errors, location: '' });
    }
  };




  // Chỉ cho nhập số và tối đa 12 ký tự cho CCCD
  const handleCCCDChange = (event) => {
    let value = event.target.value.replace(/[^0-9]/g, ''); // Lọc chỉ cho phép số
    if (value.length === 1 && value !== '0') {
      value = '0' + value; // Nếu số đầu tiên không phải 0, thêm 0 vào đầu
    }
    value = value.slice(0, 12); // Giới hạn độ dài tối đa là 12
    setFormData({
      ...formData,
      cccd: value,
    });
    if (errors.cccd) {
      setErrors({ ...errors, cccd: '' });
    }
  };
  //lấy vị trí
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setSnackbar({ open: true, message: 'Trình duyệt không hỗ trợ định vị!', severity: 'error' });
      return;
    }




    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await response.json();
          const address = data.display_name || '';
          setFormData((prev) => ({
            ...prev,
            location: address,
          }));
          setSnackbar({ open: true, message: 'Đã lấy vị trí thành công!', severity: 'success' });
        } catch (err) {
          setSnackbar({ open: true, message: 'Không thể lấy địa chỉ từ tọa độ!', severity: 'error' });
        }
      },
      (error) => {
        setSnackbar({ open: true, message: 'Lỗi lấy vị trí: ' + error.message, severity: 'error' });
      }
    );
  };








  const validateStep = () => {
    const newErrors = {};
    if (activeStep === 0) {
      if (!formData.patientName) newErrors.patientName = 'Vui lòng nhập tên bệnh nhân';
      if (!formData.bloodType) newErrors.bloodType = 'Vui lòng chọn nhóm máu';
      if (!formData.cccd) {
        newErrors.cccd = 'Vui lòng nhập số CCCD';
      } else if (!/^\d{12}$/.test(formData.cccd)) {
        newErrors.cccd = 'Số CCCD phải là 12 chữ số';
      }
    } else if (activeStep === 1) {
      if (!formData.contactName) newErrors.contactName = 'Vui lòng nhập tên người liên hệ';
      // Kiểm tra số điện thoại Việt Nam
      if (!formData.contactPhone) {
        newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
      } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(formData.contactPhone)) {
        newErrors.contactPhone = 'Số điện thoại không hợp lệ (phải là số Việt Nam, 10 số, bắt đầu 03,05,07,08,09)';
      }
      // Kiểm tra email phải là gmail
      if (formData.contactEmail) {
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.contactEmail)) {
          newErrors.contactEmail = 'Email phải đúng định dạng và kết thúc bằng @gmail.com';
        }
      }




      if (!formData.location) newErrors.location = 'Vui lòng nhập địa chỉ';
      else if (/[^a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\/,.]/g.test(formData.location)) {
        newErrors.location = 'Địa chỉ chỉ được chứa chữ, số, dấu phẩy, dấu chấm, dấu gạch chéo.';
      }




    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };




  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };




  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };




  const handleSubmit = async () => {
    if (validateStep()) {
      try {
        // Ánh xạ BloodTypeId từ tên sang id
        const selectedBloodType = bloodTypes.find(b => b.name === formData.bloodType);
        if (!selectedBloodType) {
          setErrors({ ...errors, bloodType: 'Nhóm máu không hợp lệ' });
          return;
        }
        // Chuẩn bị payload cho UrgentBloodRequestController
        const payload = {
          PatientName: formData.patientName,
          RequestedBloodTypeId: selectedBloodType.id,


          CitizenNumber: formData.cccd,
          Reason: formData.reason,
          ContactName: formData.contactName,
          ContactPhone: formData.contactPhone,
          ContactEmail: formData.contactEmail,
          EmergencyLocation: formData.location,
          Notes: formData.notes,
        };








        await axios.post('/api/UrgentBloodRequest', payload);
        setSnackbar({ open: true, message: 'Gửi yêu cầu thành công!', severity: 'success' });
        setActiveStep(0);
        setFormData({
          patientName: '',
          bloodType: '',
          quantity: '',
          contactName: '',
          contactPhone: '',
          contactEmail: '',
          location: '',
          reason: '',
          notes: '',
          cccd: '',
        });
      } catch (error) {
        let msg = 'Có lỗi khi gửi yêu cầu!';
        if (error.response && error.response.data && error.response.data.message) {
          msg = error.response.data.message;
          console.log(msg);
        }
        setSnackbar({ open: true, message: msg, severity: 'error' });




      }
    }
  };




  const reasonOptions = [
    {
      value: 'Tai nạn giao thông',
      label: 'Tai nạn giao thông',
      desc: 'Gây mất máu nhiều do va chạm xe máy, ô tô hoặc tai nạn đường bộ nghiêm trọng.'
    },
    {
      value: 'Tai nạn lao động / sinh hoạt',
      label: 'Tai nạn lao động / sinh hoạt',
      desc: 'Té ngã, đập đầu, bị vật rơi trúng, tai nạn khi làm việc gây chấn thương nặng, mất máu.'
    },
    {
      value: 'Băng huyết sau sinh',
      label: 'Băng huyết sau sinh',
      desc: 'Xuất huyết ồ ạt sau khi sinh thường hoặc sinh mổ, là một tình huống cấp cứu sản khoa.'
    },
    {
      value: 'Vỡ thai ngoài tử cung',
      label: 'Vỡ thai ngoài tử cung',
      desc: 'Một biến chứng nguy hiểm trong thai kỳ, gây xuất huyết nội cần truyền máu khẩn cấp.'
    },
    {
      value: 'Xuất huyết tiêu hóa',
      label: 'Xuất huyết tiêu hóa',
      desc: 'Nôn ra máu, đi ngoài phân đen do vỡ tĩnh mạch thực quản hoặc loét dạ dày nặng.'
    },
    {
      value: 'Vết thương do dao / súng',
      label: 'Vết thương do dao / súng',
      desc: 'Bị đâm, chém, hoặc trúng đạn dẫn đến mất máu cấp.'
    },
    {
      value: 'Chấn thương nội tạng',
      label: 'Chấn thương nội tạng',
      desc: 'Vỡ lách, gan hoặc các cơ quan nội tạng do tai nạn, chấn thương mạnh vào bụng.'
    },
    {
      value: 'Phẫu thuật khẩn cấp',
      label: 'Phẫu thuật khẩn cấp',
      desc: 'Mổ cấp cứu không lường trước, thường trong các ca chấn thương hoặc bệnh lý cấp.'
    },
    {
      value: 'Sốc mất máu',
      label: 'Sốc mất máu',
      desc: 'Tình trạng huyết áp tụt, mạch yếu do mất máu nhiều, đe dọa tính mạng.'
    },
    {
      value: 'Tai nạn thể thao',
      label: 'Tai nạn thể thao',
      desc: 'Chấn thương nặng trong khi chơi thể thao như gãy xương, tổn thương mạch máu.'
    },
    {
      value: 'Khác',
      label: 'Khác',
      desc: 'Trường hợp khẩn cấp khác không nằm trong danh sách trên.'
    },
  ];




  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên bệnh nhân"
                value={formData.patientName}
                onChange={handlePatientNameChange}
                error={!!errors.patientName}
                helperText={errors.patientName}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số CCCD"
                value={formData.cccd}
                onChange={handleCCCDChange}
                error={!!errors.cccd}
                helperText={errors.cccd}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 12 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.bloodType}>
                <InputLabel>Nhóm máu cần</InputLabel>
                <Select
                  value={formData.bloodType}
                  label="Nhóm máu cần"
                  onChange={handleChange('bloodType')}
                >
                  {bloodTypes.map((type) => (
                    <MenuItem key={type.id} value={type.name}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.bloodType && (
                  <FormHelperText>{errors.bloodType}</FormHelperText>
                )}
              </FormControl>
            </Grid>




            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Lý do cần máu</InputLabel>
                <Select
                  value={formData.reason}
                  label="Lý do cần máu"
                  onChange={handleChange('reason')}
                >
                  {reasonOptions.map((option, idx) => (
                    <MenuItem key={option.value} value={option.value}>
                      <Box>
                        <Typography fontWeight="bold">{idx + 1}. {option.label}</Typography>
                        <Typography variant="caption" color="text.secondary">{option.desc}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>




            {formData.reason === 'Khác' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nhập lý do khác"
                  multiline
                  rows={2}
                  value={formData.notes}
                  onChange={handleChange('notes')}
                />
              </Grid>




            )}




            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tiền sử bệnh nhân ( nếu biết )"
                value={formData.notes}
                onChange={handleChange('notes')}
                error={!!errors.notes}
                helperText={errors.notes}




              />
            </Grid>
          </Grid>




        );




      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tên người nhà bệnh nhân"
                value={formData.contactName}
                onChange={handleContactNameChange}
                error={!!errors.contactName}
                helperText={errors.contactName}
              />
            </Grid>




            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại người nhà bệnh nhân"
                value={formData.contactPhone}
                onChange={handleContactPhoneChange}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 10 }}
              />
            </Grid>




            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email người nhà bệnh nhân ( nếu có )"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange('contactEmail')}
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
              />




            </Grid>




            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="Địa chỉ hiện tại"
                  value={formData.location}
                  onChange={handleLocationChange}
                  error={!!errors.location}
                  helperText={errors.location}
                />
                <Button variant="outlined" onClick={handleGetLocation}>
                  Lấy vị trí
                </Button>
              </Box>
            </Grid>












          </Grid>
        );




      case 2:
        return (
          <Box>
            <Alert severity="info" sx={{ mb: 3 }}>
              Vui lòng kiểm tra lại thông tin trước khi gửi yêu cầu
            </Alert>




            <Card variant="outlined" sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin yêu cầu
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tên bệnh nhân
                    </Typography>
                    <Typography>{formData.patientName}</Typography>
                  </Grid>




                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Nhóm máu cần
                    </Typography>
                    <Typography>
                      <Chip
                        icon={<Bloodtype />}
                        label={formData.bloodType}
                        color="error"
                        size="small"
                      />
                    </Typography>
                  </Grid>




                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số CCCD
                    </Typography>
                    <Typography>{formData.cccd}</Typography>
                  </Grid>


                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Lý do cần máu
                    </Typography>
                    <Typography>{formData.reason}</Typography>
                  </Grid>




                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Ghi chú
                    </Typography>
                    <Typography>{formData.notes || 'Không có'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>




            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Thông tin liên hệ
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Người liên hệ
                    </Typography>
                    <Typography>{formData.contactName}</Typography>
                  </Grid>




                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Số điện thoại
                    </Typography>
                    <Typography>{formData.contactPhone}</Typography>
                  </Grid>




                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Email
                    </Typography>
                    <Typography>{formData.contactEmail}</Typography>
                  </Grid>




                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Địa chỉ
                    </Typography>
                    <Typography>{formData.location}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        );




      default:
        return null;
    }
  };




  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Đăng ký cần máu khẩn cấp
      </Typography>




      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>




      <Card>
        <CardContent>
          {renderStepContent(activeStep)}




          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep > 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Quay lại
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Gửi yêu cầu
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNext}
              >
                Tiếp tục
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>




      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} elevation={6} variant="filled">
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Container>
  );
};




export default EmergencyRequest;
import React, { useState } from 'react';
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

const EmergencyRequest = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    requestType: 'individual', // Luôn là 'individual'
    hospitalName: '',
    patientName: '',
    bloodType: '',
    quantity: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    location: '',
    reason: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});

  const steps = ['Thông tin cơ bản', 'Thông tin liên hệ', 'Xác nhận'];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
    const value = event.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
    setFormData({
      ...formData,
      patientName: value,
    });
    if (errors.patientName) {
      setErrors({ ...errors, patientName: '' });
    }
  };

  const handleQuantityChange = (event) => {
    let value = event.target.value.replace(/[^0-9]/g, '').slice(0, 4); // chỉ cho nhập tối đa 4 số
    if (value !== '' && Number(value) > 1000) value = '1000'; // không cho nhập quá 1000
    setFormData({
      ...formData,
      quantity: value,
    });
    if (errors.quantity) {
      setErrors({ ...errors, quantity: '' });
    }
  };

  const handleReasonChange = (event) => {
    const value = event.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
    setFormData({
      ...formData,
      reason: value,
    });
  };

  const handleContactNameChange = (event) => {
    const value = event.target.value.replace(/[^a-zA-ZÀ-ỹ\s]/g, '');
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

  const validateStep = () => {
    const newErrors = {};
    if (activeStep === 0) {
      // Bỏ kiểm tra requestType và hospitalName
      if (!formData.patientName) newErrors.patientName = 'Vui lòng nhập tên bệnh nhân';
      if (!formData.bloodType) newErrors.bloodType = 'Vui lòng chọn nhóm máu';
      if (!formData.quantity) newErrors.quantity = 'Vui lòng nhập số lượng máu cần';
    } else if (activeStep === 1) {
      if (!formData.contactName) newErrors.contactName = 'Vui lòng nhập tên người liên hệ';
      // Kiểm tra số điện thoại Việt Nam
      if (!formData.contactPhone) {
        newErrors.contactPhone = 'Vui lòng nhập số điện thoại';
      } else if (!/^0[3|5|7|8|9][0-9]{8}$/.test(formData.contactPhone)) {
        newErrors.contactPhone = 'Số điện thoại không hợp lệ (phải là số Việt Nam, 10 số, bắt đầu 03,05,07,08,09)';
      }
      // Kiểm tra email phải là gmail
      if (!formData.contactEmail) {
        newErrors.contactEmail = 'Vui lòng nhập email';
      } else if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(formData.contactEmail)) {
        newErrors.contactEmail = 'Email phải đúng định dạng và kết thúc bằng @gmail.com';
      }
      if (!formData.location) newErrors.location = 'Vui lòng nhập địa chỉ';
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

  const handleSubmit = () => {
    if (validateStep()) {
      // Xử lý gửi form
      console.log('Form submitted:', formData);
      // Reset form và chuyển về bước đầu
      setActiveStep(0);
      setFormData({
        requestType: 'individual',
        hospitalName: '',
        patientName: '',
        bloodType: '',
        quantity: '',
        contactName: '',
        contactPhone: '',
        contactEmail: '',
        location: '',
        reason: '',
        notes: '',
      });
    }
  };

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
              <FormControl fullWidth error={!!errors.bloodType}>
                <InputLabel>Nhóm máu cần</InputLabel>
                <Select
                  value={formData.bloodType}
                  label="Nhóm máu cần"
                  onChange={handleChange('bloodType')}
                >
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
                {errors.bloodType && (
                  <FormHelperText>{errors.bloodType}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số lượng máu cần (ml)"
                type="text"
                value={formData.quantity}
                onChange={handleQuantityChange}
                error={!!errors.quantity}
                helperText={errors.quantity}
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lý do cần máu"
                multiline
                rows={3}
                value={formData.reason}
                onChange={handleReasonChange}
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
                label="Tên người liên hệ"
                value={formData.contactName}
                onChange={handleContactNameChange}
                error={!!errors.contactName}
                helperText={errors.contactName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số điện thoại"
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
                label="Email"
                type="email"
                value={formData.contactEmail}
                onChange={handleChange('contactEmail')}
                error={!!errors.contactEmail}
                helperText={errors.contactEmail}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.location}
                onChange={handleChange('location')}
                error={!!errors.location}
                helperText={errors.location}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú thêm"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleChange('notes')}
              />
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
                      Loại yêu cầu
                    </Typography>
                    <Typography>
                      Cá nhân
                    </Typography>
                  </Grid>

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
                      Số lượng máu
                    </Typography>
                    <Typography>{formData.quantity} ml</Typography>
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
    </Container>
  );
};

export default EmergencyRequest; 
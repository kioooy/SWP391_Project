import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Snackbar,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import {
  CrisisAlert as EmergencyIcon,
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Notifications as NotificationsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import axios from "axios";

const EmergencyCaseHandler = ({ searchResults, onCaseResolved }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDonors, setSelectedDonors] = useState([]);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const steps = [
    "Phân tích tình huống",
    "Chọn người hiến phù hợp",
    "Gửi thông báo khẩn cấp",
    "Theo dõi phản hồi",
    "Hoàn tất",
  ];

  const handleDonorSelect = (donor) => {
    setSelectedDonors(prev => {
      const exists = prev.find(d => d.userId === donor.userId);
      if (exists) {
        return prev.filter(d => d.userId !== donor.userId);
      } else {
        return [...prev, donor];
      }
    });
  };

  const handleSendEmergencyNotifications = async () => {
    if (selectedDonors.length === 0) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn ít nhất một người hiến!",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Gửi thông báo cho từng người hiến được chọn
      const notificationPromises = selectedDonors.map(donor =>
        axios.post("/api/Notification/CreateUrgentDonationRequest", {
          userId: donor.userId,
          message: notificationMessage || "Cần máu khẩn cấp! Vui lòng liên hệ ngay.",
        }, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      await Promise.all(notificationPromises);
      
      setSnackbar({
        open: true,
        message: `Đã gửi thông báo khẩn cấp đến ${selectedDonors.length} người hiến!`,
        severity: "success",
      });
      
      setCurrentStep(3); // Chuyển sang bước theo dõi
    } catch (error) {
      console.error("Error sending notifications:", error);
      setSnackbar({
        open: true,
        message: "Lỗi khi gửi thông báo!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCaseResolved = () => {
    setCurrentStep(4);
    if (onCaseResolved) {
      onCaseResolved();
    }
  };

  const getCaseStatus = () => {
    if (searchResults?.availableBloodUnits?.length > 0) {
      return {
        type: "success",
        title: "Có máu sẵn sàng",
        message: `Tìm thấy ${searchResults.availableBloodUnits.length} đơn vị máu phù hợp. Có thể tiến hành truyền máu ngay.`,
      };
    } else if (searchResults?.suggestedDonors?.length > 0) {
      return {
        type: "warning",
        title: "Cần huy động người hiến",
        message: `Không có máu sẵn. Tìm thấy ${searchResults.suggestedDonors.length} người hiến phù hợp. Cần liên hệ khẩn cấp.`,
      };
    } else {
      return {
        type: "error",
        title: "Tình huống khẩn cấp",
        message: "Không có máu sẵn và không tìm thấy người hiến phù hợp. Cần huy động khẩn cấp toàn bộ hệ thống.",
      };
    }
  };

  const caseStatus = getCaseStatus();

  return (
    <Box>
      {/* Emergency Status */}
      <Alert 
        severity={caseStatus.type} 
        icon={<EmergencyIcon />}
        sx={{ mb: 3 }}
      >
        <Typography variant="h6" fontWeight="bold">
          {caseStatus.title}
        </Typography>
        <Typography variant="body2">
          {caseStatus.message}
        </Typography>
      </Alert>

      {/* Workflow Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={currentStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Phân tích tình huống
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Đơn vị máu có sẵn:
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {searchResults?.availableBloodUnits?.length || 0}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Người hiến phù hợp:
                </Typography>
                <Typography variant="h4" color="warning.main" fontWeight="bold">
                  {searchResults?.suggestedDonors?.length || 0}
                </Typography>
              </Grid>
            </Grid>
            <Button
              variant="contained"
              onClick={() => setCurrentStep(1)}
              sx={{ mt: 2 }}
            >
              Tiếp tục
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 1 && searchResults?.suggestedDonors && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Chọn người hiến phù hợp ({searchResults.suggestedDonors.length} người)
            </Typography>
            <List>
              {searchResults.suggestedDonors.map((donor, index) => (
                <ListItem
                  key={donor.userId}
                  button
                  selected={selectedDonors.some(d => d.userId === donor.userId)}
                  onClick={() => handleDonorSelect(donor)}
                  sx={{
                    border: 1,
                    borderColor: selectedDonors.some(d => d.userId === donor.userId) 
                      ? 'primary.main' 
                      : 'divider',
                    borderRadius: 1,
                    mb: 1,
                  }}
                >
                  <ListItemIcon>
                    <PersonIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary={donor.fullName}
                    secondary={
                      <Box>
                        <Typography variant="body2">
                          Nhóm máu: {donor.bloodTypeName}
                        </Typography>
                        <Typography variant="body2">
                          Số lần hiến: {donor.donationCount || 0}
                        </Typography>
                      </Box>
                    }
                  />
                  {selectedDonors.some(d => d.userId === donor.userId) && (
                    <CheckCircleIcon color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
            <Button
              variant="contained"
              onClick={() => setCurrentStep(2)}
              disabled={selectedDonors.length === 0}
              sx={{ mt: 2 }}
            >
              Tiếp tục với {selectedDonors.length} người hiến
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Gửi thông báo khẩn cấp
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Nội dung thông báo"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Nhập nội dung thông báo khẩn cấp..."
              sx={{ mb: 2 }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Sẽ gửi thông báo đến {selectedDonors.length} người hiến được chọn.
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={handleSendEmergencyNotifications}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <NotificationsIcon />}
            >
              {loading ? "Đang gửi..." : "Gửi thông báo khẩn cấp"}
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && (
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Theo dõi phản hồi
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              Đã gửi thông báo khẩn cấp. Đang chờ phản hồi từ người hiến...
            </Alert>
            <Grid container spacing={2}>
              {selectedDonors.map((donor) => (
                <Grid item xs={12} md={6} key={donor.userId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {donor.fullName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Nhóm máu: {donor.bloodTypeName}
                      </Typography>
                      <Chip
                        label="Đã gửi thông báo"
                        color="info"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            <Button
              variant="contained"
              onClick={handleCaseResolved}
              sx={{ mt: 2 }}
            >
              Hoàn tất xử lý
            </Button>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && (
        <Card>
          <CardContent>
            <Box sx={{ textAlign: "center" }}>
              <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
              <Typography variant="h6" sx={{ mb: 1 }}>
                Đã hoàn tất xử lý tình huống khẩn cấp
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Hệ thống đã gửi thông báo và đang theo dõi phản hồi.
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmergencyCaseHandler; 
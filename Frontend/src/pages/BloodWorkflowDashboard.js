import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Paper,
  Chip,
  Alert,
  Snackbar,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  IconButton,
  Tooltip,
  Badge,
} from "@mui/material";
import {
  Search as SearchIcon,
  Approval as ApprovalIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Bloodtype as BloodIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Notifications as NotificationsIcon,
  CrisisAlert as CrisisAlertIcon,
} from "@mui/icons-material";
import axios from "axios";
import BloodSearch from "./BloodSearch";
import TransfusionManagement from "./TransfusionManagement .js";
import EmergencyCaseHandler from "./EmergencyCaseHandler";

const BloodWorkflowDashboard = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);
  const [workflowData, setWorkflowData] = useState({
    searchResults: null,
    selectedBloodUnits: [],
    transfusionRequests: [],
    pendingApprovals: [],
    donationRequests: [],
    emergencyRequests: [],
  });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const steps = [
    // Đã xóa bước yêu cầu cần máu
  ];

  useEffect(() => {
    fetchWorkflowData();
  }, []);

  // Lắng nghe event chuyển tab sang 'Tìm kiếm máu' khi bấm nút 'Kết nối người hiến máu'
  useEffect(() => {
    const handler = () => setCurrentTab(1);
    window.addEventListener('openBloodSearchTab', handler);
    return () => window.removeEventListener('openBloodSearchTab', handler);
  }, []);

  const fetchWorkflowData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Fetch all related data
      const [transfusionResponse, donationResponse] = await Promise.all([
        axios.get("/api/TransfusionRequest", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("/api/DonationRequest", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      
      const pendingRequests = transfusionResponse.data.filter(
        req => req.status === "Pending"
      );
      
      const emergencyRequests = transfusionResponse.data.filter(
        req => req.isEmergency === true
      );
      
      setWorkflowData(prev => ({
        ...prev,
        transfusionRequests: transfusionResponse.data,
        pendingApprovals: pendingRequests,
        donationRequests: donationResponse.data || [],
        emergencyRequests,
      }));
    } catch (error) {
      console.error("Error fetching workflow data:", error);
      setSnackbar({
        open: true,
        message: "Không thể tải dữ liệu workflow!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStepChange = (step) => {
    setActiveStep(step);
    setCurrentTab(step);
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
    setActiveStep(newValue);
  };

  const handleSearchComplete = (results) => {
    setWorkflowData(prev => ({
      ...prev,
      searchResults: results,
    }));
    
    // Auto-advance based on search results
    if (results.availableBloodUnits && results.availableBloodUnits.length > 0) {
      setActiveStep(2); // Có máu sẵn → Chuyển sang duyệt
    } else if (results.suggestedDonors && results.suggestedDonors.length > 0) {
      setActiveStep(2); // Có người hiến → Chuyển sang kết nối
    } else {
      setActiveStep(1); // Không có gì → Ở lại bước tìm kiếm
    }
  };

  const handleApprovalComplete = () => {
    setActiveStep(3); // Chuyển sang bước thực hiện
    fetchWorkflowData(); // Refresh data
  };

  const handleDonationComplete = () => {
    fetchWorkflowData(); // Refresh data
  };

  const getStepStatus = (stepIndex) => {
    if (stepIndex < activeStep) return "completed";
    if (stepIndex === activeStep) return "active";
    return "pending";
  };

  const getStepColor = (stepIndex) => {
    const status = getStepStatus(stepIndex);
    switch (status) {
      case "completed":
        return "success";
      case "active":
        return steps[stepIndex]?.color || "primary";
      default:
        return "disabled";
    }
  };

  const getWorkflowStats = () => {
    const { transfusionRequests, donationRequests, emergencyRequests, searchResults } = workflowData;
    
    return {
      pendingRequests: transfusionRequests.filter(r => r.status === "Pending").length,
      approvedRequests: transfusionRequests.filter(r => r.status === "Approved").length,
      completedRequests: transfusionRequests.filter(r => r.status === "Completed").length,
      emergencyRequests: emergencyRequests.length,
      activeDonations: donationRequests.filter(r => r.status === "Active").length,
      availableBloodUnits: searchResults?.availableBloodUnits?.length || 0,
      suggestedDonors: searchResults?.suggestedDonors?.length || 0,
    };
  };

  const stats = getWorkflowStats();

  return (
    <Box sx={{ minHeight: "100vh", p: 3 }}>
      {/* Header */}
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2 }}>

        Quản Lý Quy Trình Hiến Máu
      </Typography>
    
      {/* Workflow Stepper */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stepper activeStep={activeStep} orientation="horizontal">
            {steps.map((step, index) => (
              <Step key={index} completed={getStepStatus(index) === "completed"}>
                <StepLabel
                  icon={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        bgcolor: getStepColor(index) === "success" ? "success.main" : 
                                getStepColor(index) === "primary" ? "primary.main" :
                                getStepColor(index) === "info" ? "info.main" :
                                getStepColor(index) === "warning" ? "warning.main" :
                                "grey.300",
                        color: "white",
                      }}
                    >
                      {step.icon}
                    </Box>
                  }
                  onClick={() => handleStepChange(index)}
                  sx={{ cursor: "pointer" }}
                >
                  <Typography variant="subtitle2" fontWeight="bold">
                    {step.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.description}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Chỉ giữ 1 tab: Yêu cầu cần máu */}
          <TransfusionManagement 
            onApprovalComplete={handleApprovalComplete}
            showCreateButton={true}
            layoutProps={{ p: 3 }}
          />
        </CardContent>
      </Card>

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

export default BloodWorkflowDashboard; 
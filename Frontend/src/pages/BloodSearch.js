import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Divider,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Bloodtype as BloodIcon,
  Person as PersonIcon,
  LocalHospital as HospitalIcon,
} from "@mui/icons-material";
import axios from "axios";

const BloodSearch = ({ onSearchComplete }) => {
  const [searchForm, setSearchForm] = useState({
    recipientBloodTypeId: "",
    requiredVolume: "",
    component: "",
  });
  
  const [donorRequestForm, setDonorRequestForm] = useState({
    recipientBloodTypeId: "",
    requiredVolume: "",
  });

  const [searchResults, setSearchResults] = useState(null);
  const [donorRequestResults, setDonorRequestResults] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [donorRequestLoading, setDonorRequestLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Đối tượng ánh xạ dịch thuật cho nhóm máu
  const bloodTypeTranslations = {
    "A+": "A+",
    "A-": "A-",
    "B+": "B+",
    "B-": "B-",
    "AB+": "AB+",
    "AB-": "AB-",
    "O+": "O+",
    "O-": "O-",
  };

  // Đối tượng ánh xạ dịch thuật cho thành phần máu
  const bloodComponentTranslations = {
    "Whole Blood": "Máu toàn phần",
    "Red Blood Cells": "Hồng cầu",
    "Plasma": "Huyết tương",
    "Platelets": "Tiểu cầu",
  };

  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/BloodType", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBloodTypes(response.data || []);
      } catch (error) {
        console.error("Error fetching blood types:", error);
      }
    };
    // Lấy danh sách thành phần máu
    const fetchComponents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/BloodComponent", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComponents(response.data || []);
      } catch (error) {
        console.error("Error fetching blood components:", error);
      }
    };
    fetchBloodTypes();
    fetchComponents();
  }, []);

  const handleSearch = async () => {
    if (!searchForm.recipientBloodTypeId || !searchForm.requiredVolume) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đầy đủ thông tin!",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      // Log debug mới
      console.log("[DEBUG] Tìm kiếm máu:", {
        recipientBloodTypeId: searchForm.recipientBloodTypeId,
        requiredVolume: searchForm.requiredVolume,
        componentId: searchForm.component || null
      });
      const url = `/api/BloodSearch/search-blood-units/${searchForm.recipientBloodTypeId}/${searchForm.requiredVolume}` +
        (searchForm.component ? `?componentId=${searchForm.component}` : '');
      console.log("[DEBUG] API URL:", url);
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("[DEBUG] API Response:", response.data);
      setSearchResults(response.data);
      
      // Call callback if provided
      if (onSearchComplete) {
        onSearchComplete(response.data);
      }
      
      setSnackbar({
        open: true,
        message: "Tìm kiếm thành công!",
        severity: "success",
      });
    } catch (error) {
      // Log debug lỗi mới
      console.error("[DEBUG] Error searching blood:", error);
      console.error("[DEBUG] Error response:", error.response);
      console.error("[DEBUG] Error response data:", error.response?.data);
      console.error("[DEBUG] Error status:", error.response?.status);
      console.error("[DEBUG] Error message:", error.message);
      
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.response?.data?.error || "Tìm kiếm thất bại!",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDonors = async () => {
    if (!donorRequestForm.recipientBloodTypeId || !donorRequestForm.requiredVolume) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đầy đủ thông tin!",
        severity: "error",
      });
      return;
    }

    setDonorRequestLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `/api/BloodSearch/request-donors-with-hospital/${donorRequestForm.recipientBloodTypeId}/${donorRequestForm.requiredVolume}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setDonorRequestResults(response.data);
      setSnackbar({
        open: true,
        message: "Đã gửi yêu cầu huy động người hiến!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error requesting donors:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Huy động người hiến thất bại!",
        severity: "error",
      });
    } finally {
      setDonorRequestLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold" }}>
        Tìm kiếm máu và người hiến phù hợp
      </Typography>

      <Grid container spacing={3}>
        {/* Tìm kiếm máu phù hợp */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <SearchIcon color="primary" />
                <Typography variant="h6">Tìm kiếm máu phù hợp</Typography>
              </Box>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Nhóm máu cần tìm</InputLabel>
                  <Select
                    value={searchForm.recipientBloodTypeId}
                    onChange={(e) => setSearchForm({ ...searchForm, recipientBloodTypeId: e.target.value })}
                    label="Nhóm máu cần tìm"
                  >
                    {bloodTypes
                      .filter(bt => bt.bloodTypeName !== "Không Biết")
                      .map(bt => (
                      <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>
                        {bloodTypeTranslations[bt.bloodTypeName] || bt.bloodTypeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Dropdown chọn thành phần máu */}
                <FormControl fullWidth>
                  <InputLabel>Thành phần máu</InputLabel>
                  <Select
                    value={searchForm.component || ""}
                    onChange={(e) => setSearchForm({ ...searchForm, component: e.target.value })}
                    label="Thành phần máu"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {components.map((c) => (
                      <MenuItem key={c.componentId} value={c.componentId}>
                        {bloodComponentTranslations[c.componentName] || c.componentName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  label="Lượng máu cần (ml)"
                  type="number"
                  value={searchForm.requiredVolume}
                  onChange={(e) => setSearchForm({ ...searchForm, requiredVolume: e.target.value })}
                  inputProps={{ min: 1 }}
                  fullWidth
                />

                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  fullWidth
                >
                  {loading ? "Đang tìm kiếm..." : "Tìm kiếm máu"}
                </Button>
              </Box>

              {/* Kết quả tìm kiếm */}
              {searchResults && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Kết quả tìm kiếm
                  </Typography>
                  {/* Danh sách máu trong kho */}
                  {searchResults.availableBloodUnits && searchResults.availableBloodUnits.length > 0 ? (
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Nhóm máu</TableCell>
                            <TableCell>Thành phần</TableCell>
                            <TableCell>Lượng còn</TableCell>
                            <TableCell>HSD</TableCell>
                            <TableCell>Trạng thái</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {searchResults.availableBloodUnits.map((unit) => (
                            <TableRow key={unit.bloodUnitId}>
                              <TableCell>{unit.bloodUnitId}</TableCell>
                              <TableCell>{unit.bloodTypeName}</TableCell>
                              <TableCell>{bloodComponentTranslations[unit.componentName] || unit.componentName}</TableCell>
                              <TableCell>{unit.remainingVolume}ml</TableCell>
                              <TableCell>{formatDateTime(unit.expiryDate)}</TableCell>
                              <TableCell>
                                <Chip 
                                  label={unit.bloodStatus} 
                                  color={unit.bloodStatus === "Available" ? "success" : "warning"} 
                                  size="small" 
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <>
                      <Alert severity="warning" sx={{ mb: 2 }}>
                        Không tìm thấy máu phù hợp trong kho. Vui lòng chuyển sang trang <b>Huy động người hiến</b> để liên hệ người hiến phù hợp.
                      </Alert>
                      {searchResults.suggestedDonors && searchResults.suggestedDonors.length > 0 ? (
                        <>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>
                            Danh sách người hiến phù hợp:
                          </Typography>
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Họ tên</TableCell>
                                  <TableCell>Nhóm máu</TableCell>
                                  <TableCell>Cân nặng</TableCell>
                                  <TableCell>Chiều cao</TableCell>
                                  <TableCell>Số điện thoại</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {searchResults.suggestedDonors.map((donor) => (
                                  <TableRow key={donor.userId}>
                                    <TableCell>{donor.fullName}</TableCell>
                                    <TableCell>{donor.bloodTypeName}</TableCell>
                                    <TableCell>{donor.weight} kg</TableCell>
                                    <TableCell>{donor.height} cm</TableCell>
                                    <TableCell>{donor.phoneNumber || 'Ẩn'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </>
                      ) : (
                        <Alert severity="info">Không có người hiến phù hợp.</Alert>
                      )}
                    </>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Huy động người hiến */}
        {/* PHẦN NÀY ĐÃ ĐƯỢC TÁCH RIÊNG, XÓA HOÀN TOÀN */}
      </Grid>

      {/* Hướng dẫn sử dụng */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hướng dẫn sử dụng
          </Typography>
          <Typography variant="body2">
            <b>🔍 Tìm kiếm máu phù hợp:</b><br/>
            1. Chọn nhóm máu cần tìm<br/>
            2. Chọn thành phần máu (nếu cần)<br/>
            3. Nhập lượng máu cần thiết<br/>
            4. Nhấn "Tìm kiếm máu" để tra cứu kho máu phù hợp<br/>
            5. Nếu không có máu phù hợp, hãy chuyển sang trang "Huy động người hiến" để gửi thông báo tới cộng đồng người hiến máu.<br/>
          </Typography>
        </CardContent>
      </Card>

      {/* Snackbar thông báo */}
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

export default BloodSearch; 
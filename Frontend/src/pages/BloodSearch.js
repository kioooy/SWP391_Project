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

const BloodSearch = () => {
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

    fetchBloodTypes();
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
      const url = `/api/BloodSearch/search-with-hospital-location/${searchForm.recipientBloodTypeId}/${searchForm.requiredVolume}` +
        (searchForm.component ? `?component=${encodeURIComponent(searchForm.component)}` : '');
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data);
      setSnackbar({
        open: true,
        message: "Tìm kiếm thành công!",
        severity: "success",
      });
    } catch (error) {
      console.error("Error searching blood:", error, error.response?.data);
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
        Tìm kiếm máu và huy động người hiến
      </Typography>

      <Grid container spacing={3}>
        {/* Tìm kiếm máu phù hợp */}
        <Grid item xs={12} md={6}>
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
                    <MenuItem value="Whole Blood">Máu toàn phần</MenuItem>
                    <MenuItem value="Red Blood Cells">Hồng cầu</MenuItem>
                    <MenuItem value="Plasma">Huyết tương</MenuItem>
                    <MenuItem value="Platelets">Tiểu cầu</MenuItem>
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
                    <Alert severity="warning">
                      Không tìm thấy máu phù hợp trong kho. Vui lòng huy động người hiến.
                    </Alert>
                  )}

                  {searchResults.suggestedDonors && searchResults.suggestedDonors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Người hiến phù hợp ({searchResults.suggestedDonors.length} người)
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tên</TableCell>
                              <TableCell>Nhóm máu</TableCell>
                              <TableCell>SĐT</TableCell>
                              <TableCell>Email</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {searchResults.suggestedDonors.map((donor, idx) => (
                              <TableRow key={donor.userId || idx}>
                                <TableCell>{donor.fullName || donor.FullName}</TableCell>
                                <TableCell>{donor.bloodTypeName || donor.BloodTypeName}</TableCell>
                                <TableCell>{donor.phoneNumber || donor.PhoneNumber || '-'}</TableCell>
                                <TableCell>{donor.email || donor.Email || '-'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Huy động người hiến */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <NotificationsIcon color="primary" />
                <Typography variant="h6">Huy động người hiến</Typography>
              </Box>
              
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Nhóm máu cần huy động</InputLabel>
                  <Select
                    value={donorRequestForm.recipientBloodTypeId}
                    onChange={(e) => setDonorRequestForm({ ...donorRequestForm, recipientBloodTypeId: e.target.value })}
                    label="Nhóm máu cần huy động"
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

                <TextField
                  label="Lượng máu cần (ml)"
                  type="number"
                  value={donorRequestForm.requiredVolume}
                  onChange={(e) => setDonorRequestForm({ ...donorRequestForm, requiredVolume: e.target.value })}
                  inputProps={{ min: 1 }}
                  fullWidth
                />

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={handleRequestDonors}
                  disabled={donorRequestLoading}
                  startIcon={donorRequestLoading ? <CircularProgress size={20} /> : <NotificationsIcon />}
                  fullWidth
                >
                  {donorRequestLoading ? "Đang gửi yêu cầu..." : "Huy động người hiến"}
                </Button>
              </Box>

              {/* Kết quả huy động */}
              {donorRequestResults && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Kết quả huy động
                  </Typography>
                  
                  <Alert severity="success">
                    Đã gửi thông báo đến {donorRequestResults.notifiedDonorsCount || 0} người hiến phù hợp.
                  </Alert>

                  {donorRequestResults.notifiedDonors && donorRequestResults.notifiedDonors.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1 }}>
                        Danh sách người hiến đã được thông báo
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Tên</TableCell>
                              <TableCell>Nhóm máu</TableCell>
                              <TableCell>SĐT</TableCell>
                              <TableCell>Trạng thái</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {donorRequestResults.notifiedDonors.map((donor) => (
                              <TableRow key={donor.userId}>
                                <TableCell>{donor.fullName}</TableCell>
                                <TableCell>{donor.bloodTypeName}</TableCell>
                                <TableCell>{donor.phoneNumber}</TableCell>
                                <TableCell>
                                  <Chip label="Đã thông báo" color="success" size="small" />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Hướng dẫn sử dụng */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Hướng dẫn sử dụng
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                🔍 Tìm kiếm máu phù hợp:
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                1. Chọn nhóm máu cần tìm<br/>
                2. Chọn thành phần máu<br/>
                3. Nhập lượng máu cần thiết<br/>
                4. Hệ thống sẽ tìm kiếm máu phù hợp trong kho và người hiến
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
                📢 Huy động người hiến:
              </Typography>
              <Typography variant="body2">
                1. Chọn nhóm máu cần huy động<br/>
                2. Nhập lượng máu cần thiết<br/>
                3. Hệ thống sẽ gửi thông báo đến người hiến phù hợp
              </Typography>
            </Grid>
          </Grid>
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
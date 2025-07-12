import React, { useState, useEffect } from "react";
import {
  Box, Card, CardContent, Typography, TextField, Button, FormControl, InputLabel, Select, MenuItem, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Alert, CircularProgress, Divider
} from "@mui/material";
import axios from "axios";

const DonorMobilization = () => {
  const [form, setForm] = useState({
    recipientBloodTypeId: "",
    component: "",
    requiredVolume: ""
  });
  const [bloodTypes, setBloodTypes] = useState([]);
  const [components, setComponents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifiedDonors, setNotifiedDonors] = useState([]);

  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/BloodType", { headers: { Authorization: `Bearer ${token}` } });
        setBloodTypes(response.data || []);
      } catch (error) { console.error("Error fetching blood types:", error); }
    };
    const fetchComponents = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/BloodComponent", { headers: { Authorization: `Bearer ${token}` } });
        setComponents(response.data || []);
      } catch (error) { console.error("Error fetching blood components:", error); }
    };
    fetchBloodTypes();
    fetchComponents();
  }, []);

  const handleSearchDonors = async () => {
    if (!form.recipientBloodTypeId) {
      setSnackbar({ open: true, message: "Vui lòng chọn nhóm máu!", severity: "error" });
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      let url = `/api/BloodSearch/search-donors-detail/${form.recipientBloodTypeId}`;
      if (form.component) url += `?componentId=${form.component}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
      setDonors(response.data.suggestedDonors || []);
      setSnackbar({ open: true, message: "Tìm kiếm thành công!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Tìm kiếm thất bại!", severity: "error" });
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNotifyAll = async () => {
    if (!message.trim()) {
      setSnackbar({ open: true, message: "Vui lòng nhập nội dung thông báo!", severity: "error" });
      return;
    }
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/api/BloodSearch/notify-all-donors", { message }, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: response.data.message || "Đã gửi thông báo đến tất cả người hiến đủ điều kiện!", severity: "success" });
      setMessage("");
      setNotifiedDonors(response.data.notifiedDonors || []);
    } catch (error) {
      setSnackbar({ open: true, message: error.response?.data?.message || "Gửi thông báo thất bại!", severity: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh" }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: "bold", color: '#E53935' }}>Gửi thông báo</Typography>
      <Card sx={{ mb: 3, boxShadow: 'none', background: 'none' }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Xóa toàn bộ các Grid item chọn nhóm máu, thành phần máu, lượng máu cần, và nút tìm người hiến phù hợp */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>Gửi thông báo tới tất cả người hiến đủ điều kiện</Typography>
              <TextField
                label="Nội dung thông báo"
                value={message}
                onChange={e => setMessage(e.target.value)}
                fullWidth
                multiline
                minRows={2}
                sx={{ mb: 2 }}
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleNotifyAll}
                disabled={sending}
                startIcon={sending ? <CircularProgress size={20} /> : null}
                fullWidth
              >

                {sending ? "Đang gửi..." : "Gửi thông báo tới tất cả người hiến đủ điều kiện"}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
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
      {/* Hiển thị danh sách người nhận thông báo nếu có */}
      {notifiedDonors.length > 0 && (
        <Card sx={{ mt: 3, boxShadow: 'none', background: 'none' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>Danh sách người nhận thông báo</Typography>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Nhóm máu</TableCell>
                    <TableCell>Số điện thoại</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Cân nặng</TableCell>
                    <TableCell>Chiều cao</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifiedDonors.map((donor, idx) => (
                    <TableRow key={donor.userId || idx}>
                      <TableCell>{donor.fullName}</TableCell>
                      <TableCell>{donor.bloodTypeName}</TableCell>
                      <TableCell>{donor.phoneNumber || 'Ẩn'}</TableCell>
                      <TableCell>{donor.email || 'Ẩn'}</TableCell>
                      <TableCell>{donor.weight ? `${donor.weight} kg` : 'N/A'}</TableCell>
                      <TableCell>{donor.height ? `${donor.height} cm` : 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default DonorMobilization; 
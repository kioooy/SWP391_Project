import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Alert,
  Grid,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button
} from "@mui/material";
import axios from "axios";

const BLOOD_TYPES = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

// Hàm chuyển tên thành phần máu sang tiếng Việt
const bloodComponentNameVi = (en) => {
  switch (en) {
    case 'Whole Blood': return 'Máu toàn phần';
    case 'Red Blood Cells': return 'Hồng cầu';
    case 'Plasma': return 'Huyết tương';
    case 'Platelets': return 'Tiểu cầu';
    default: return en;
  }
};

const BloodCompatibilityPage = () => {
  // State lưu danh sách thành phần máu lấy từ backend
  const [bloodComponents, setBloodComponents] = useState([]);

  // Lấy danh sách thành phần máu từ backend khi load trang
  useEffect(() => {
    const fetchBloodComponents = async () => {
      try {
        const res = await axios.get('/api/BloodComponent');
        setBloodComponents(res.data);
      } catch (err) {
        setBloodComponents([]);
        setSnackbar({ open: true, message: 'Không lấy được danh sách thành phần máu!', severity: 'error' });
        console.error('[DEBUG] Lỗi khi gọi API /api/BloodComponent:', err);
      }
    };
    fetchBloodComponents();
  }, []);

  // Card 1: Truyền máu toàn phần
  const [wholeBloodType, setWholeBloodType] = useState("");
  const [wholeBloodResult, setWholeBloodResult] = useState(null);
  const [wholeBloodLoading, setWholeBloodLoading] = useState(false);

  // Card 2: Theo thành phần máu
  const [componentBloodType, setComponentBloodType] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [componentResult, setComponentResult] = useState(null);
  const [componentLoading, setComponentLoading] = useState(false);

  // Snackbar chung
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  // Lấy userId từ localStorage hoặc redux (giả định đã lưu userId khi đăng nhập)
  const userId = localStorage.getItem("userId");

  // Lấy BloodTypeId và tên nhóm máu của user
  useEffect(() => {
    const fetchUserBloodType = async () => {
      if (!userId) {
        console.log("[DEBUG] userId không tồn tại trong localStorage");
        return;
      }
      try {
        console.log("[DEBUG] userId:", userId);
        const res = await axios.get(`/api/User/${userId}/blood-type-id`);
        console.log("[DEBUG] Kết quả API /api/User/{userId}/blood-type-id:", res.data);
        if (res.data && res.data.bloodTypeId) {
          // Lấy tên nhóm máu từ BloodTypes
          const bloodTypeRes = await axios.get(`/api/BloodType/${res.data.bloodTypeId}`);
          console.log("[DEBUG] Kết quả API /api/BloodType/{bloodTypeId}:", bloodTypeRes.data);
          setWholeBloodType(bloodTypeRes.data.bloodTypeName || "");
          setComponentBloodTypeId(res.data.bloodTypeId); // Lưu bloodTypeId cho tra cứu
        } else {
          console.log("[DEBUG] Không có bloodTypeId trong kết quả trả về");
        }
      } catch (err) {
        setWholeBloodType("");
        console.error("Không thể lấy thông tin nhóm máu người dùng:", err);
      }
    };
    fetchUserBloodType();
  }, [userId]);

  // State lưu bloodTypeId để truyền cho API
  const [componentBloodTypeId, setComponentBloodTypeId] = useState(null);

  // Lấy kết quả truyền máu toàn phần khi vào trang
  useEffect(() => {
    const fetchWholeBloodInfo = async () => {
      if (!componentBloodTypeId) return;
      setWholeBloodLoading(true);
      setWholeBloodResult(null);
      try {
        const res = await axios.get(`/api/BloodCompatibility/whole-blood`, {
          params: { bloodTypeId: componentBloodTypeId }
        });
        setWholeBloodResult(res.data.compatibleBloodTypes);
      } catch (err) {
        setWholeBloodResult(null);
        setSnackbar({
          open: true,
          message: err.response?.data || "Không tìm thấy dữ liệu phù hợp!",
          severity: "error"
        });
      } finally {
        setWholeBloodLoading(false);
      }
    };
    fetchWholeBloodInfo();
  }, [componentBloodTypeId]);

  // Lấy danh sách nhóm máu từ backend (nếu muốn động, còn không thì dùng BLOOD_TYPES như cũ)
  const [bloodTypes, setBloodTypes] = useState([]);

  useEffect(() => {
    const fetchBloodTypes = async () => {
      try {
        const res = await axios.get('/api/BloodType');
        setBloodTypes(res.data);
      } catch (err) {
        setBloodTypes([]);
      }
    };
    fetchBloodTypes();
  }, []);

  // State cho select nhóm máu toàn phần
  const [selectedBloodTypeId, setSelectedBloodTypeId] = useState("");
  const [showWholeBloodResult, setShowWholeBloodResult] = useState(false);

  // Lấy kết quả truyền máu toàn phần khi chọn nhóm máu và bấm tra cứu
  const handleWholeBloodSearch = async () => {
    if (!selectedBloodTypeId) {
      setSnackbar({ open: true, message: "Vui lòng chọn nhóm máu!", severity: "warning" });
      return;
    }
    setWholeBloodLoading(true);
    setWholeBloodResult(null);
    setShowWholeBloodResult(false);
    try {
      const res = await axios.get(`/api/BloodCompatibility/whole-blood`, {
        params: { bloodTypeId: selectedBloodTypeId }
      });
      setWholeBloodResult(res.data.compatibleBloodTypes);
      setShowWholeBloodResult(true);
    } catch (err) {
      setWholeBloodResult(null);
      setShowWholeBloodResult(false);
      setSnackbar({
        open: true,
        message: err.response?.data || "Không tìm thấy dữ liệu phù hợp!",
        severity: "error"
      });
    } finally {
      setWholeBloodLoading(false);
    }
  };

  // Tra cứu theo thành phần máu
  const handleComponentSearch = async () => {
    if (!selectedComponent) {
      setSnackbar({ open: true, message: "Vui lòng chọn thành phần máu!", severity: "warning" });
      return;
    }
    setComponentLoading(true);
    setComponentResult(null);
    try {
      const res = await axios.get(`/api/BloodCompatibility/component-by-user`, {
        params: {
          bloodTypeId: componentBloodTypeId,
          componentId: selectedComponent
        }
      });
      console.log('[DEBUG] Kết quả trả về từ API /api/BloodCompatibility/component-by-user:', res.data);
      setComponentResult(res.data);
    } catch (err) {
      setComponentResult(null);
      setSnackbar({
        open: true,
        message: err.response?.data || "Không tìm thấy dữ liệu phù hợp!",
        severity: "error"
      });
    } finally {
      setComponentLoading(false);
    }
  };

  const selectLabelId = "blood-component-label";

  // Lấy tên tiếng Anh của thành phần máu đã chọn
  const selectedComponentName = bloodComponents.find(c => c.componentId === Number(selectedComponent))?.componentName || "";

  return (
    <Box sx={{ background: "#fff", minHeight: "100vh", py: 4 }}>
      <Grid container justifyContent="center" spacing={4}>
        {/* Card 1: Truyền máu toàn phần */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                Tra cứu nhóm máu phù hợp cho truyền máu toàn phần
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="whole-blood-type-label">Chọn nhóm máu</InputLabel>
                <Select
                  labelId="whole-blood-type-label"
                  value={selectedBloodTypeId}
                  label="Chọn nhóm máu"
                  onChange={e => setSelectedBloodTypeId(e.target.value)}
                >
                  {bloodTypes.map(bt => (
                    <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>{bt.bloodTypeName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleWholeBloodSearch}
                disabled={wholeBloodLoading || !selectedBloodTypeId}
                sx={{ mb: 2 }}
              >
                {wholeBloodLoading ? "Đang tìm kiếm..." : "Tìm kiếm"}
              </Button>
              {showWholeBloodResult && wholeBloodResult && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle1" color="secondary" sx={{ mb: 1 }}>
                    Nhóm máu có thể truyền cho bạn là:
                  </Typography>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableBody>
                        {wholeBloodResult.length > 0 ? (
                          wholeBloodResult.map((type, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{type}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell>Không có nhóm máu phù hợp.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        {/* Card 2: Theo thành phần máu */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                Tra cứu nhóm máu phù hợp theo thành phần máu
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {/* Dropdown chọn nhóm máu */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="component-blood-type-label">Chọn nhóm máu</InputLabel>
                <Select
                  labelId="component-blood-type-label"
                  value={componentBloodTypeId || ""}
                  label="Chọn nhóm máu"
                  onChange={e => setComponentBloodTypeId(e.target.value)}
                >
                  {bloodTypes.map(bt => (
                    <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>{bt.bloodTypeName}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {/* Dropdown chọn thành phần máu */}
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id={selectLabelId} shrink>Thành phần máu</InputLabel>
                <Select
                  labelId={selectLabelId}
                  value={selectedComponent}
                  label="Thành phần máu"
                  onChange={e => setSelectedComponent(e.target.value)}
                >
                  {bloodComponents
                    .filter(c => c.componentName !== 'Whole Blood')
                    .map(c => (
                      <MenuItem key={c.componentId} value={c.componentId}>{bloodComponentNameVi(c.componentName)}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleComponentSearch}
                disabled={componentLoading || !selectedComponent || !componentBloodTypeId}
              >
                {componentLoading ? "Đang tra cứu..." : "Tra cứu thành phần máu"}
              </Button>
              {/* Hiển thị kết quả tra cứu thành phần máu */}
              {componentResult && componentResult.compatibleBloodTypes && (
                <Box sx={{ mt: 3, maxHeight: 200, overflowY: 'auto' }}>
                  <Typography variant="subtitle1" color="secondary" sx={{ mb: 1 }}>
                    Nhóm máu hiện tại với "{bloodComponentNameVi(selectedComponentName)}" có sẵn có thể truyền cho bạn:
                  </Typography>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {componentResult.compatibleBloodTypes.length > 0 ? (
                      componentResult.compatibleBloodTypes.map((type, idx) => (
                        <li key={idx}>{type}</li>
                      ))
                    ) : (
                      <li>Không có nhóm máu phù hợp.</li>
                    )}
                  </ul>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default BloodCompatibilityPage; 
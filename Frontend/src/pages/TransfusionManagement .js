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
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Tooltip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Bloodtype as BloodIcon,
} from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';
import axios from "axios";

// Thay thế useTransfusionStore bằng kết nối API thật và bổ sung các trường mới
const useTransfusionStore = () => {
  const [transfusions, setTransfusions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/TransfusionRequest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransfusions(res.data);
      } catch (err) {
        setError("Không thể lấy dữ liệu truyền máu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateTransfusion = async (id, data) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/TransfusionRequest/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Sau khi cập nhật, reload lại danh sách
      const res = await axios.get("/api/TransfusionRequest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfusions(res.data);
      return { success: true };
    } catch (err) {
      setError("Cập nhật trạng thái truyền máu thất bại!");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  return {
    transfusions,
    loading,
    error,
    updateTransfusion,
    clearError: () => setError(null),
  };
};

const TransfusionManagement = () => {
  const user = useSelector(selectUser);
  const { transfusions, loading, error, updateTransfusion, clearError } = useTransfusionStore();
  const [editDialog, setEditDialog] = useState({
    open: false,
    transfusion: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const statusOptions = ["Đã duyệt", "Hoàn thành", "Từ chối"];

  const getStatusColor = (status) => {
    const colors = {
      "Đã duyệt": "primary",
      "Hoàn thành": "success",
      "Từ chối": "error",
    };
    return colors[status] || "default";
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Formik validation schema
  const validationSchema = Yup.object({
    ResponsibleById: Yup.number().nullable(),
    Status: Yup.string().oneOf(statusOptions).required("Status is required"),
    Notes: Yup.string().max(500, "Notes must be less than 500 characters"),
  });

  const formik = useFormik({
    initialValues: {
      Status: "",
      Notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const result = await updateTransfusion(
        editDialog.transfusion.TransfusionId,
        {
          Status: values.Status,
          Notes: values.Notes || null,
        }
      );

      if (result.success) {
        setSnackbar({
          open: true,
          message: "Transfusion updated successfully!",
          severity: "success",
        });
        handleCloseDialog();
      } else {
        setSnackbar({
          open: true,
          message: "Failed to update transfusion",
          severity: "error",
        });
      }
    },
  });

  const handleEditClick = (transfusion) => {
    formik.setValues({
      Status: transfusion.Status,
      Notes: transfusion.Notes || "",
    });
    setEditDialog({ open: true, transfusion });
  };

  const handleCloseDialog = () => {
    setEditDialog({ open: false, transfusion: null });
    formik.resetForm();
  };

  const getStatistics = () => {
    return statusOptions.map((status) => ({
      status,
      count: transfusions.filter((t) => t.Status === status).length,
    }));
  };

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Thống kê */}
      <Grid container spacing={2} sx={{ mb: 3, justifyContent: "center" }}>
        {getStatistics().map(({ status, count }) => (
          <Grid item xs={12} sm={6} md={3} key={status}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {status}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {count}
                    </Typography>
                  </Box>
                  <Chip label={status} color={getStatusColor(status)} size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bảng truyền máu */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Danh sách yêu cầu truyền máu
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Thông tin truyền máu</TableCell>
                  <TableCell>Người nhận</TableCell>
                  <TableCell>Chi tiết máu</TableCell>
                  <TableCell>Ngày giờ</TableCell>
                  <TableCell>Người phụ trách</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Ghi chú</TableCell>
                  <TableCell>Tình trạng bệnh nhân</TableCell>
                  <TableCell>Ngày duyệt</TableCell>
                  <TableCell>Ngày hoàn thành</TableCell>
                  <TableCell>Ngày hủy</TableCell>
                  <TableCell>Ngày từ chối</TableCell>
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transfusions.map((transfusion) => (
                  <TableRow key={transfusion.TransfusionId} hover>
                    {/* Thông tin truyền máu */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Mã: {transfusion.TransfusionId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lượng: {transfusion.TransfusionVolume}ml
                        </Typography>
                        {transfusion.IsEmergency && (
                          <Box sx={{ mt: 0.5 }}>
                            <Chip icon={<BloodIcon />} label="Khẩn cấp" color="error" size="small" variant="outlined" />
                          </Box>
                        )}
                      </Box>
                    </TableCell>
                    {/* Người nhận */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.Member?.User?.FullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cân nặng: {transfusion?.Member?.Weight}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Chiều cao: {transfusion?.Member?.Height}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Chi tiết máu */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.BloodType?.BloodTypeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {transfusion?.BloodComponent?.ComponentName}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          {transfusion?.BloodUnit?.BloodUnitId || "N/A"}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Ngày giờ */}
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Yêu cầu: {formatDateTime(transfusion?.RequestDate)}
                        </Typography>
                        {transfusion?.PreferredReceiveDate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Mong muốn: {formatDateTime(transfusion?.PreferredReceiveDate)}
                          </Typography>
                        )}
                        {transfusion.ApprovalDate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Duyệt: {formatDateTime(transfusion?.ApprovalDate)}
                          </Typography>
                        )}
                        {transfusion.CompletionDate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Hoàn thành: {formatDateTime(transfusion?.CompletionDate)}
                          </Typography>
                        )}
                        {transfusion.CancelledDate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Hủy: {formatDateTime(transfusion?.CancelledDate)}
                          </Typography>
                        )}
                        {transfusion.RejectedDate && (
                          <Typography variant="caption" display="block" color="text.secondary">
                            Từ chối: {formatDateTime(transfusion?.RejectedDate)}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {/* Người phụ trách */}
                    <TableCell>
                      {transfusion.ResponsibleBy ? (
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.ResponsibleBy?.FullName}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Chưa phân công
                        </Typography>
                      )}
                    </TableCell>
                    {/* Trạng thái */}
                    <TableCell>
                      <Chip label={transfusion?.Status} color={getStatusColor(transfusion?.Status)} size="small" />
                    </TableCell>
                    {/* Ghi chú */}
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        {transfusion.Notes ? (
                          <Tooltip title={transfusion?.Notes} arrow>
                            <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {transfusion?.Notes}
                            </Typography>
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" color="text.secondary" fontStyle="italic">
                            Không có ghi chú
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    {/* Tình trạng bệnh nhân */}
                    <TableCell>
                      {transfusion.PatientCondition || <span style={{ fontStyle: "italic", color: "gray" }}>Không có</span>}
                    </TableCell>
                    {/* Ngày duyệt */}
                    <TableCell>
                      {transfusion.ApprovalDate ? formatDateTime(transfusion.ApprovalDate) : <span style={{ fontStyle: "italic", color: "gray" }}>Chưa duyệt</span>}
                    </TableCell>
                    {/* Ngày hoàn thành */}
                    <TableCell>
                      {transfusion.CompletionDate ? formatDateTime(transfusion.CompletionDate) : <span style={{ fontStyle: "italic", color: "gray" }}>Chưa hoàn thành</span>}
                    </TableCell>
                    {/* Ngày hủy */}
                    <TableCell>
                      {transfusion.CancelledDate ? formatDateTime(transfusion.CancelledDate) : <span style={{ fontStyle: "italic", color: "gray" }}>Chưa hủy</span>}
                    </TableCell>
                    {/* Ngày từ chối */}
                    <TableCell>
                      {transfusion.RejectedDate ? formatDateTime(transfusion.RejectedDate) : <span style={{ fontStyle: "italic", color: "gray" }}>Chưa từ chối</span>}
                    </TableCell>
                    {/* Hành động */}
                    <TableCell align="center">
                      <Tooltip title="Chỉnh sửa yêu cầu">
                        <IconButton color="primary" onClick={() => handleEditClick(transfusion)} disabled={loading}>
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog chỉnh sửa */}
      <Dialog open={editDialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditIcon color="primary" />
              Chỉnh sửa yêu cầu #{editDialog.transfusion?.TransfusionId}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              <TextField
                select
                label="Trạng thái"
                name="Status"
                value={formik.values.Status}
                onChange={formik.handleChange}
                error={formik.touched.Status && Boolean(formik.errors.Status)}
                helperText={formik.touched.Status && formik.errors.Status}
                required
                fullWidth
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={status} color={getStatusColor(status)} size="small" />
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
              {/* Ghi chú */}
              <TextField
                label="Ghi chú"
                name="Notes"
                value={formik.values.Notes}
                onChange={formik.handleChange}
                error={formik.touched.Notes && Boolean(formik.errors.Notes)}
                helperText={formik.touched.Notes && formik.errors.Notes}
                multiline
                rows={4}
                placeholder="Nhập ghi chú về truyền máu..."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} startIcon={<CancelIcon />} disabled={loading}>
              Hủy
            </Button>
            <Button type="submit" variant="contained" startIcon={<SaveIcon />} disabled={loading}>
              {loading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Snackbar thông báo */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Xử lý lỗi */}
      {error && (
        <Snackbar open={Boolean(error)} autoHideDuration={6000} onClose={clearError}>
          <Alert onClose={clearError} severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        </Snackbar>
      )}
    </Box>
  );
};

export default TransfusionManagement;

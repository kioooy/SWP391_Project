import React, { useState, useEffect, useCallback } from "react";
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
  FormControl,
  InputLabel,
  Select,
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
import { Autocomplete, createFilterOptions } from "@mui/material";

// Thay thế useTransfusionStore bằng kết nối API thật và bổ sung các trường mới
const useTransfusionStore = () => {
  const [transfusions, setTransfusions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.count('useTransfusionStore useEffect');
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/TransfusionRequest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTransfusions(res.data);
        console.log("Fetched transfusions:", res.data); // Debug log
      } catch (err) {
        setError("Không thể lấy dữ liệu truyền máu!");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const updateTransfusion = useCallback(async (id, data) => {
    console.count('updateTransfusion useCallback');
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
  }, []);

  // Thêm hàm reloadTransfusions
  const reloadTransfusions = useCallback(async () => {
    console.count('reloadTransfusions useCallback');
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/TransfusionRequest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfusions(res.data);
      // console.log("Reloaded transfusions:", res.data); // Debug log
    } catch (err) {
      setError("Không thể lấy dữ liệu truyền máu!");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    transfusions,
    loading,
    error,
    updateTransfusion,
    clearError: () => setError(null),
    reloadTransfusions,
  };
};

const TransfusionManagement = () => {
  const user = useSelector(selectUser);
  const { transfusions, loading, error, updateTransfusion, clearError, reloadTransfusions } = useTransfusionStore();
  const [editDialog, setEditDialog] = useState({
    open: false,
    transfusion: null,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    MemberId: "",
    BloodTypeId: "",
    BloodComponentId: "",
    TransfusionVolume: "",
    Notes: "",
  });
  const [createLoading, setCreateLoading] = useState(false);
  const [newlyCreatedId, setNewlyCreatedId] = useState(null); // Track newly created request
  const [statusFilter, setStatusFilter] = useState("All"); // Filter for status
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null }); // Filter for date range
  const [members, setMembers] = useState([]);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [bloodComponents, setBloodComponents] = useState([]);

  // State và hàm cho Dialog chi tiết
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedTransfusionForDetails, setSelectedTransfusionForDetails] = useState(null);

  // States và hàm cho dialog Approve
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [transfusionToApprove, setTransfusionToApprove] = useState(null);
  const [approveBloodUnitId, setApproveBloodUnitId] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [bloodUnits, setBloodUnits] = useState([]); // Để lựa chọn BloodUnit

  // States và hàm cho dialog Complete
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [transfusionToComplete, setTransfusionToComplete] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  // States và hàm cho dialog Cancel
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [transfusionToCancel, setTransfusionToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Đối tượng ánh xạ dịch thuật cho các thành phần máu
  const bloodComponentTranslations = {
    "Whole Blood": "Máu toàn phần",
    "Red Blood Cells": "Hồng cầu",
    "Plasma": "Huyết tương",
    "Platelets": "Tiểu cầu",
    // Thêm các bản dịch khác nếu cần
  };

  // Đối tượng ánh xạ dịch thuật cho trạng thái truyền máu
  const transfusionStatusTranslations = {
    "Approved": "Đã duyệt",
    "Pending": "Đang chờ",
    "Completed": "Hoàn thành",
    "Cancelled": "Đã hủy",
    "Rejected": "Từ chối",
  };

  const statusOptions = ["Approved", "Pending", "Completed", "Cancelled", "Rejected"]; // Cập nhật để khớp với BE

  const getStatusColor = (status) => {
    const colors = {
      "Approved": "error", // Thay đổi màu cho Approved thành đỏ
      "Pending": "info", // Màu mới cho trạng thái Pending
      "Completed": "success",
      "Cancelled": "warning", // Màu mới cho trạng thái Cancelled
      "Rejected": "error",
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
      // Logic cũ cho việc chỉnh sửa chung (có thể giữ lại nếu cần)
      // Hiện tại, sẽ ưu tiên các nút Approve/Complete/Cancel riêng
      const result = await updateTransfusion(
        editDialog.transfusion.transfusionId,
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
      Status: transfusion.status,
      Notes: transfusion.notes || "",
    });
    setEditDialog({ open: true, transfusion });
  };

  const handleCloseDialog = () => {
    setEditDialog({ open: false, transfusion: null });
    formik.resetForm();
  };

  // ----- Hàm xử lý cho các Dialog Approve/Complete/Cancel -----

  // Approve Dialog
  const handleOpenApproveDialog = (transfusion) => {
    setTransfusionToApprove(transfusion);
    setOpenApproveDialog(true);
    setApproveBloodUnitId(""); // Reset input
    setApproveNotes(""); // Reset notes
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setTransfusionToApprove(null);
    setApproveBloodUnitId("");
    setApproveNotes("");
  };

  const handleConfirmApprove = async () => {
    setApproveLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/TransfusionRequest/${transfusionToApprove.transfusionId}/approve`, {
        bloodUnitId: parseInt(approveBloodUnitId),
        notes: approveNotes || null,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToApprove.transfusionId} đã được duyệt!`,
        severity: "success",
      });
      handleCloseApproveDialog();
      await reloadTransfusions();
    } catch (err) {
      console.error("Error approving transfusion request:", err);
      const errorMessage = err.response?.data?.message || "Duyệt yêu cầu thất bại.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setApproveLoading(false);
    }
  };

  // Complete Dialog
  const handleOpenCompleteDialog = (transfusion) => {
    setTransfusionToComplete(transfusion);
    setOpenCompleteDialog(true);
  };

  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
    setTransfusionToComplete(null);
  };

  const handleConfirmComplete = async () => {
    setCompleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/TransfusionRequest/${transfusionToComplete.transfusionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToComplete.transfusionId} đã hoàn thành!`,
        severity: "success",
      });
      handleCloseCompleteDialog();
      await reloadTransfusions();
    } catch (err) {
      console.error("Error completing transfusion request:", err);
      const errorMessage = err.response?.data?.message || "Hoàn thành yêu cầu thất bại.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setCompleteLoading(false);
    }
  };

  // Cancel Dialog
  const handleOpenCancelDialog = (transfusion) => {
    setTransfusionToCancel(transfusion);
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setTransfusionToCancel(null);
  };

  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`/api/TransfusionRequest/${transfusionToCancel.transfusionId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToCancel.transfusionId} đã hủy!`,
        severity: "success",
      });
      handleCloseCancelDialog();
      await reloadTransfusions();
    } catch (err) {
      console.error("Error cancelling transfusion request:", err);
      const errorMessage = err.response?.data?.message || "Hủy yêu cầu thất bại.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    } finally {
      setCancelLoading(false);
    }
  };

  const getStatistics = () => {
    return statusOptions.map((status) => ({
      status,
      count: transfusions.filter((t) => t.status === status).length,
    }));
  };

  // Filter transfusions based on status and date
  const filteredTransfusions = transfusions.filter(transfusion => {
    // Filter by status
    if (statusFilter !== "All" && transfusion.status !== statusFilter) {
      return false;
    }
    
    // Filter by date range
    if (dateFilter.startDate || dateFilter.endDate) {
      const requestDate = new Date(transfusion.requestDate);
      
      if (dateFilter.startDate && requestDate < new Date(dateFilter.startDate)) {
        return false;
      }
      
      if (dateFilter.endDate) {
        const endDate = new Date(dateFilter.endDate);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        if (requestDate > endDate) {
          return false;
        }
      }
    }
    
    return true;
  });

  useEffect(() => {
    console.count('TransfusionManagement useEffect');
    const fetchDataForDropdowns = async () => {
      const token = localStorage.getItem("token");
      try {
        // Lấy danh sách member
        const resMembers = await axios.get("/api/User/members", { headers: { Authorization: `Bearer ${token}` } });
        setMembers(resMembers.data || []);
        // console.log("Fetched members:", resMembers.data); // Debug log
        // Lấy danh sách nhóm máu
        const resBloodTypes = await axios.get("/api/BloodType", { headers: { Authorization: `Bearer ${token}` } });
        setBloodTypes(resBloodTypes.data || []);
        // console.log("Fetched blood types:", resBloodTypes.data); // Debug log
        // Lấy danh sách thành phần máu
        const resBloodComponents = await axios.get("/api/BloodComponent", { headers: { Authorization: `Bearer ${token}` } });
        setBloodComponents(resBloodComponents.data || []);
        console.log("Blood components loaded:", resBloodComponents.data);
        
        // Lấy danh sách blood units cho việc duyệt
        const resBloodUnits = await axios.get("/api/BloodUnit/available", { headers: { Authorization: `Bearer ${token}` } });
        setBloodUnits(resBloodUnits.data || []);
        // console.log("Fetched blood units:", resBloodUnits.data);
      } catch (err) {
        console.error("Error fetching data for dropdowns:", err);
      }
    };
    
    fetchDataForDropdowns();
  }, []);

  const handleRowClick = (transfusion) => {
    setSelectedTransfusionForDetails(transfusion);
    setOpenDetailDialog(true);
  };

  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedTransfusionForDetails(null);
  };

  // Filter options for Autocomplete (cho phép tìm kiếm theo FullName, CitizenNumber, Email, PhoneNumber)
  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 100, // Tăng giới hạn kết quả trả về để đảm bảo tìm thấy
    stringify: (option) => `${
      option.fullName || ''       
    } ${option.citizenNumber || ''} ${option.email || ''} ${option.phoneNumber || ''}`,
  });

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
                      {transfusionStatusTranslations[status] || status}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                      {count}
                    </Typography>
                  </Box>
                  <Chip label={transfusionStatusTranslations[status] || status} color={getStatusColor(status)} size="small" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bộ lọc và nút tạo mới */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Status Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Lọc theo trạng thái"
            >
              <MenuItem value="All">Tất cả trạng thái</MenuItem>
              <MenuItem value="Pending">Đang chờ</MenuItem>
              <MenuItem value="Approved">Đã duyệt</MenuItem>
              <MenuItem value="Completed">Hoàn thành</MenuItem>
              <MenuItem value="Cancelled">Đã hủy</MenuItem>
              <MenuItem value="Rejected">Từ chối</MenuItem>
            </Select>
          </FormControl>
          
          {/* Date Range Filter */}
          <TextField
            label="Từ ngày"
            type="date"
            value={dateFilter.startDate || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
            inputProps={{
              max: dateFilter.endDate || undefined
            }}
          />
          
          <TextField
            label="Đến ngày"
            type="date"
            value={dateFilter.endDate || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
            inputProps={{
              min: dateFilter.startDate || undefined
            }}
          />
          
          {/* Quick Date Filters */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Lọc nhanh</InputLabel>
            <Select
              value=""
              onChange={(e) => {
                const today = new Date();
                const value = e.target.value;
                
                switch(value) {
                  case 'today':
                    setDateFilter({
                      startDate: today.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                    break;
                  case 'yesterday':
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    setDateFilter({
                      startDate: yesterday.toISOString().split('T')[0],
                      endDate: yesterday.toISOString().split('T')[0]
                    });
                    break;
                  case 'thisWeek':
                    const startOfWeek = new Date(today);
                    startOfWeek.setDate(today.getDate() - today.getDay());
                    setDateFilter({
                      startDate: startOfWeek.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                    break;
                  case 'thisMonth':
                    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                    setDateFilter({
                      startDate: startOfMonth.toISOString().split('T')[0],
                      endDate: today.toISOString().split('T')[0]
                    });
                    break;
                  case 'lastMonth':
                    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                    const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    setDateFilter({
                      startDate: lastMonth.toISOString().split('T')[0],
                      endDate: endOfLastMonth.toISOString().split('T')[0]
                    });
                    break;
                  default:
                    break;
                }
              }}
              label="Lọc nhanh"
            >
              <MenuItem value="today">Hôm nay</MenuItem>
              <MenuItem value="yesterday">Hôm qua</MenuItem>
              <MenuItem value="thisWeek">Tuần này</MenuItem>
              <MenuItem value="thisMonth">Tháng này</MenuItem>
              <MenuItem value="lastMonth">Tháng trước</MenuItem>
            </Select>
          </FormControl>
          
          {/* Clear Filters Button */}
          {(statusFilter !== "All" || dateFilter.startDate || dateFilter.endDate) && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setStatusFilter("All");
                setDateFilter({ startDate: null, endDate: null });
              }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>
        
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenCreateDialog(true)}
        >
          Tạo yêu cầu truyền máu
        </Button>
      </Box>

      {/* Bảng truyền máu */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Danh sách yêu cầu truyền máu
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {filteredTransfusions.length} / {transfusions.length} yêu cầu
              {dateFilter.startDate && (
                <span> • Từ: {new Date(dateFilter.startDate).toLocaleDateString('vi-VN')}</span>
              )}
              {dateFilter.endDate && (
                <span> • Đến: {new Date(dateFilter.endDate).toLocaleDateString('vi-VN')}</span>
              )}
            </Typography>
          </Box>
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
                  <TableCell align="center">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTransfusions
                  .sort((a, b) => {
                    // Ưu tiên sắp xếp theo ngày tạo (mới nhất lên đầu)
                    if (a.requestDate && b.requestDate) {
                      return new Date(b.requestDate) - new Date(a.requestDate);
                    }
                    // Nếu không có ngày thì sắp xếp theo ID
                    return b.transfusionId - a.transfusionId;
                  })
                  .map((transfusion, index) => (
                    <TableRow 
                      key={transfusion.transfusionId || `transfusion-${index}`} 
                      hover 
                      onClick={() => handleRowClick(transfusion)} 
                      sx={{ 
                        cursor: 'pointer',
                        backgroundColor: newlyCreatedId === transfusion.transfusionId ? '#e8f5e8' : 'inherit',
                        '&:hover': {
                          backgroundColor: newlyCreatedId === transfusion.transfusionId ? '#d4edda' : undefined
                        }
                      }}
                    >
                    {/* Thông tin truyền máu */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          Mã: {transfusion.transfusionId}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Lượng: {transfusion.transfusionVolume}ml
                        </Typography>
                        {transfusion.isEmergency && (
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
                          {transfusion?.fullName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Cân nặng: N/A
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          Chiều cao: N/A
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Chi tiết máu */}
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.bloodTypeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {bloodComponentTranslations[transfusion?.componentName] || transfusion?.componentName || 'N/A'}
                        </Typography>
                        <Typography variant="caption" display="block" color="text.secondary">
                          N/A
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Ngày giờ */}
                    <TableCell>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Yêu cầu: {formatDateTime(transfusion?.requestDate)}
                          {transfusion?.preferredReceiveDate && (
                            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                              (Mong muốn: {formatDateTime(transfusion?.preferredReceiveDate)})
                            </Typography>
                          )}
                        </Typography>
                      </Box>
                    </TableCell>
                    {/* Người phụ trách */}
                    <TableCell>
                      {transfusion.responsibleById ? (
                        <Typography variant="body2" fontWeight="medium">
                          Mã NV: {transfusion.responsibleById}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Chưa phân công
                        </Typography>
                      )}
                    </TableCell>
                    {/* Trạng thái */}
                    <TableCell>
                      <Chip label={transfusion?.status} color={getStatusColor(transfusion?.status)} size="small" />
                    </TableCell>
                    {/* Ghi chú */}
                    <TableCell>
                      <Box sx={{ maxWidth: 200 }}>
                        {transfusion.notes ? (
                          <Tooltip title={transfusion?.notes} arrow>
                            <Typography variant="body2" color="text.secondary" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {transfusion?.notes}
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
                      {transfusion.patientCondition || <span style={{ fontStyle: "italic", color: "gray" }}>Không có</span>}
                    </TableCell>
                    {/* Hành động */}
                    <TableCell align="center">
                      {user && (user.role === "Staff" || user.role === "Admin") && (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {transfusion.status === "Pending" && (
                            <Tooltip title="Duyệt yêu cầu">
                              <IconButton color="success" onClick={(e) => { e.stopPropagation(); handleOpenApproveDialog(transfusion); }} disabled={loading}>
                                <SaveIcon /> {/* Biểu tượng Duyệt */}
                              </IconButton>
                            </Tooltip>
                          )}
                          {transfusion.status === "Approved" && (
                            <Tooltip title="Hoàn thành yêu cầu">
                              <IconButton color="primary" onClick={(e) => { e.stopPropagation(); handleOpenCompleteDialog(transfusion); }} disabled={loading}>
                                <SaveIcon /> {/* Biểu tượng Hoàn thành */}
                              </IconButton>
                            </Tooltip>
                          )}
                          {(transfusion.status === "Pending" || transfusion.status === "Approved") && (
                            <Tooltip title="Hủy yêu cầu">
                              <IconButton color="warning" onClick={(e) => { e.stopPropagation(); handleOpenCancelDialog(transfusion); }} disabled={loading}>
                                <CancelIcon /> {/* Biểu tượng Hủy */}
                              </IconButton>
                            </Tooltip>
                          )}
                           {/* Nút chỉnh sửa chung, giữ lại cho các thay đổi khác nếu cần */}
                          <Tooltip title="Chỉnh sửa chung">
                            <IconButton color="info" onClick={(e) => { e.stopPropagation(); handleEditClick(transfusion); }} disabled={loading}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialog chỉnh sửa (giữ lại nếu cần các chỉnh sửa khác ngoài status) */}
      <Dialog open={editDialog.open} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <EditIcon color="primary" />
              Chỉnh sửa yêu cầu #{editDialog.transfusion?.transfusionId}
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
                      <Chip label={transfusionStatusTranslations[status] || status} color={getStatusColor(status)} size="small" />
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

      {/* Dialog Duyệt yêu cầu truyền máu */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Duyệt yêu cầu truyền máu #{transfusionToApprove?.transfusionId}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography variant="body1">
              Người nhận: <strong>{transfusionToApprove?.fullName}</strong>
            </Typography>
            <Typography variant="body1">
              Yêu cầu: <strong>{transfusionToApprove?.transfusionVolume} ml {transfusionToApprove?.componentName} ({transfusionToApprove?.bloodTypeName})</strong>
            </Typography>
            <FormControl fullWidth required>
              <InputLabel id="blood-unit-select-label">Chọn Đơn vị máu</InputLabel>
              <Select
                labelId="blood-unit-select-label"
                value={approveBloodUnitId}
                label="Chọn Đơn vị máu"
                onChange={(e) => setApproveBloodUnitId(e.target.value)}
              >
                {bloodUnits.filter(unit => 
                  unit.bloodStatus === "Available" &&
                  unit.componentId === transfusionToApprove?.componentId &&
                  unit.bloodTypeId === transfusionToApprove?.bloodTypeId &&
                  unit.remainingVolume >= transfusionToApprove?.transfusionVolume &&
                  new Date(unit.expiryDate) >= new Date()
                ).map((unit) => (
                  <MenuItem key={unit.bloodUnitId} value={unit.bloodUnitId}>
                    ID: {unit.bloodUnitId} | Lượng còn lại: {unit.remainingVolume}ml | HSD: {formatDateTime(unit.expiryDate)}
                  </MenuItem>
                ))}
              </Select>
              {!approveBloodUnitId && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  Vui lòng chọn một đơn vị máu phù hợp.
                </Typography>
              )}
            </FormControl>
            <TextField
              label="Ghi chú duyệt (Tùy chọn)"
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog} disabled={approveLoading}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleConfirmApprove}
            disabled={!approveBloodUnitId || approveLoading}
          >
            {approveLoading ? "Đang duyệt..." : "Duyệt"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Hoàn thành yêu cầu truyền máu */}
      <Dialog open={openCompleteDialog} onClose={handleCloseCompleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu truyền máu #{transfusionToComplete?.transfusionId}</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn đánh dấu yêu cầu truyền máu #{transfusionToComplete?.transfusionId} của{" "}
            <strong>{transfusionToComplete?.fullName}</strong> là đã hoàn thành không?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Hành động này sẽ cập nhật trạng thái yêu cầu và điều chỉnh kho máu.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCompleteDialog} disabled={completeLoading}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleConfirmComplete} disabled={completeLoading}>
            {completeLoading ? "Đang hoàn thành..." : "Xác nhận Hoàn thành"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Hủy yêu cầu truyền máu */}
      <Dialog open={openCancelDialog} onClose={handleCloseCancelDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Hủy yêu cầu truyền máu #{transfusionToCancel?.transfusionId}</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn hủy yêu cầu truyền máu #{transfusionToCancel?.transfusionId} của{" "}
            <strong>{transfusionToCancel?.fullName}</strong> không?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Nếu yêu cầu đã được duyệt, đơn vị máu đã đặt chỗ sẽ được giải phóng.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog} disabled={cancelLoading}>Không</Button>
          <Button variant="contained" color="error" onClick={handleConfirmCancel} disabled={cancelLoading}>
            {cancelLoading ? "Đang hủy..." : "Xác nhận Hủy"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chi tiết yêu cầu truyền máu */}
      <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            Thông tin chi tiết yêu cầu #{selectedTransfusionForDetails?.transfusionId}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedTransfusionForDetails && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Mã yêu cầu:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.transfusionId}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Người nhận:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.fullName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Nhóm máu:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.bloodTypeName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Thành phần máu:</Typography>
                <Typography variant="body1" fontWeight="medium">{bloodComponentTranslations[selectedTransfusionForDetails?.componentName] || selectedTransfusionForDetails?.componentName || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Lượng máu:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.transfusionVolume} ml</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Khẩn cấp:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.isEmergency ? 'Có' : 'Không'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày yêu cầu:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.requestDate)}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày mong muốn nhận:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.preferredReceiveDate) || 'Chưa có'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                <Typography variant="body1" fontWeight="medium">
                  <Chip label={transfusionStatusTranslations[selectedTransfusionForDetails.status] || selectedTransfusionForDetails.status} color={getStatusColor(selectedTransfusionForDetails.status)} size="small" />
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Người phụ trách:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.responsibleById ? `Mã NV: ${selectedTransfusionForDetails.responsibleById}` : 'Chưa phân công'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Tình trạng bệnh nhân:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.patientCondition || 'Không có'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ghi chú:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.notes || 'Không có'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày duyệt:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.approvalDate) || 'Chưa duyệt'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày hoàn thành:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.completionDate) || 'Chưa hoàn thành'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày hủy:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.cancelledDate) || 'Chưa hủy'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">Ngày từ chối:</Typography>
                <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.rejectedDate) || 'Chưa từ chối'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog tạo mới yêu cầu truyền máu */}
      <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo yêu cầu truyền máu mới</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Autocomplete
              fullWidth
              options={members}
              getOptionLabel={(option) => 
                `${option.fullName || ''} ${option.email ? `(${option.email})` : ''} ${option.citizenNumber ? `(CCCD: ${option.citizenNumber})` : ''} ${option.phoneNumber ? `(SĐT: ${option.phoneNumber})` : ''}`.trim()
              }
              filterOptions={filterOptions}
              value={members.find(m => m.userId === createForm.MemberId) || null}
              onChange={(event, newValue) => {
                setCreateForm(prevForm => ({
                  ...prevForm,
                  MemberId: newValue ? newValue.userId : "",
                  BloodTypeId: newValue && newValue.bloodTypeId ? newValue.bloodTypeId : "",
                  BloodComponentId: "", // Reset BloodComponentId khi đổi member
                }));
              }}
              isOptionEqualToValue={(option, value) => option.userId === value.userId}
              renderInput={(params) => <TextField {...params} label="Người nhận" required />}
              noOptionsText="Không tìm thấy người nhận nào"
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="blood-type-label">Nhóm máu</InputLabel>
              <Select
                labelId="blood-type-label"
                value={createForm.BloodTypeId === "" ? "" : String(createForm.BloodTypeId)}
                onChange={e => setCreateForm({ ...createForm, BloodTypeId: e.target.value })}
                required
              >
                {bloodTypes
                  .filter(bt => bt.bloodTypeName !== "Không Biết")
                  .map(bt => (
                  <MenuItem key={bt.bloodTypeId} value={String(bt.bloodTypeId)}>
                    {bt.bloodTypeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel id="blood-component-label">Thành phần máu</InputLabel>
              <Select
                labelId="blood-component-label"
                value={createForm.BloodComponentId === "" ? "" : String(createForm.BloodComponentId)}
                onChange={e => {
                  console.log("Blood component selected:", e.target.value);
                  console.log("Available components:", bloodComponents);
                  setCreateForm({ ...createForm, BloodComponentId: e.target.value });
                }}
                required
              >
                {bloodComponents.map(bc => (
                  <MenuItem key={bc.componentId} value={String(bc.componentId)}>
                    {bloodComponentTranslations[bc.componentName] || bc.componentName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Lượng máu (ml)"
              value={createForm.TransfusionVolume}
              onChange={e => setCreateForm({ ...createForm, TransfusionVolume: e.target.value.replace(/[^0-9]/g, '') })}
              required
              type="number"
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Ghi chú"
              value={createForm.Notes}
              onChange={e => setCreateForm({ ...createForm, Notes: e.target.value })}
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false)} disabled={createLoading}>Hủy</Button>
          <Button
            variant="contained"
            onClick={async () => {
              // Validate
              if (!createForm.MemberId || !createForm.BloodTypeId || !createForm.BloodComponentId || !createForm.TransfusionVolume) {
                setSnackbar({ open: true, message: "Vui lòng nhập đầy đủ thông tin!", severity: "error" });
                return;
              }
              setCreateLoading(true);
              try {
                const token = localStorage.getItem("token");
                const response = await axios.post("/api/TransfusionRequest", {
                  memberId: createForm.MemberId === "" ? null : Number(createForm.MemberId),
                  bloodTypeId: createForm.BloodTypeId === "" ? null : Number(createForm.BloodTypeId),
                  componentId: createForm.BloodComponentId === "" ? null : Number(createForm.BloodComponentId),
                  transfusionVolume: Number(createForm.TransfusionVolume),
                  notes: createForm.Notes || "",
                  isEmergency: false,
                  preferredReceiveDate: null,
                  patientCondition: ""
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                // Track newly created request ID
                const newRequestId = response.data.transfusionId;
                setNewlyCreatedId(newRequestId);
                
                setSnackbar({ open: true, message: "Tạo yêu cầu truyền máu thành công!", severity: "success" });
                setOpenCreateDialog(false);
                setCreateForm({ MemberId: "", BloodTypeId: "", BloodComponentId: "", TransfusionVolume: "", Notes: "" });
                await reloadTransfusions();
                
                // Clear highlight after 5 seconds
                setTimeout(() => setNewlyCreatedId(null), 5000);
              } catch (err) {
                setSnackbar({ open: true, message: "Tạo yêu cầu thất bại!", severity: "error" });
              } finally {
                setCreateLoading(false);
              }
            }}
            disabled={createLoading}
          >
            {createLoading ? "Đang tạo..." : "Tạo mới"}
          </Button>
        </DialogActions>
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

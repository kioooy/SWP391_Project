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
import { useNavigate } from "react-router-dom";

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

const TransfusionManagement = ({ onApprovalComplete, showOnlyPending = false, showOnlyApproved = false, showCreateButton = false, layoutProps = {} }) => {
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
  const [createFormError, setCreateFormError] = useState("");
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
  const [approveSelectedUnits, setApproveSelectedUnits] = useState([]); // [{bloodUnitId, volume}]
  const [approveNotes, setApproveNotes] = useState("");
  const [approveLoading, setApproveLoading] = useState(false);
  const [suitableBloodUnits, setSuitableBloodUnits] = useState([]); // Danh sách máu phù hợp từ API

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
    // Màu giống DonationRequestManagement.js
    const colors = {
      "Approved": "warning", // Đã duyệt - cam
      "Pending": "default", // Chờ duyệt - nâu
      "Completed": "success", // Hoàn thành - xanh lá
      "Cancelled": "default", // Đã hủy - nâu
      "Rejected": "error", // Đã từ chối - đỏ
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
  const handleOpenApproveDialog = async (transfusion) => {
    setTransfusionToApprove(transfusion);
    setOpenApproveDialog(true);
    setApproveSelectedUnits([]);
    setApproveNotes("");
    // Gọi API suitable
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/BloodUnit/suitable`, {
        params: {
          bloodTypeId: transfusion.bloodTypeId,
          componentId: transfusion.componentId,
          requiredVolume: transfusion.transfusionVolume
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSuitableBloodUnits(res.data || []);
    } catch (err) {
      setSuitableBloodUnits([]);
    }
  };

  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setTransfusionToApprove(null);
    setApproveSelectedUnits([]);
    setApproveNotes("");
    setSuitableBloodUnits([]);
  };

  // Hàm chọn máu (multi-select, cộng dồn thể tích)
  const handleSelectBloodUnit = (bloodUnitId, maxVolume) => {
    // Nếu đã chọn thì bỏ chọn, chưa chọn thì thêm với volume mặc định maxVolume
    setApproveSelectedUnits(prev => {
      const exists = prev.find(u => u.bloodUnitId === bloodUnitId);
      if (exists) {
        return prev.filter(u => u.bloodUnitId !== bloodUnitId);
      } else {
        return [...prev, { bloodUnitId, volume: maxVolume }];
      }
    });
  };

  // Hàm thay đổi thể tích lấy từ từng túi
  const handleChangeUnitVolume = (bloodUnitId, value, maxVolume) => {
    let v = value === "" ? "" : parseInt(value);
    if (v !== "" && v > maxVolume) v = maxVolume;
    setApproveSelectedUnits(prev => prev.map(u => u.bloodUnitId === bloodUnitId ? { ...u, volume: v } : u));
  };

  // Tổng thể tích đã chọn
  const totalSelectedVolume = approveSelectedUnits.reduce((sum, u) => sum + u.volume, 0);
  const requiredVolume = transfusionToApprove?.transfusionVolume || 0;

  const handleConfirmApprove = async () => {
    setApproveLoading(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        bloodUnits: approveSelectedUnits.map(u => ({ bloodUnitId: u.bloodUnitId, volumeUsed: u.volume })),
        notes: approveNotes || null,
      };
      console.log("[APPROVE] PATCH payload:", payload);
      await axios.patch(`/api/TransfusionRequest/${transfusionToApprove.transfusionId}/approve`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToApprove.transfusionId} đã được duyệt!`,
        severity: "success",
      });
      handleCloseApproveDialog();
      if (onApprovalComplete) {
        onApprovalComplete();
      }
      await reloadTransfusions();
    } catch (err) {
      // Đã xóa log kiểm thử chức năng duyệt yêu cầu truyền máu
      let errorMessage = "Duyệt yêu cầu thất bại.";
      if (err.response?.data) {
        if (typeof err.response.data === "string") {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        }
      }
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
    // Show only pending if specified
    if (showOnlyPending && transfusion.status !== "Pending") {
      return false;
    }
    // Show only approved if specified
    if (showOnlyApproved && transfusion.status !== "Approved") {
      return false;
    }
    // Filter by status
    if (statusFilter === 'All') {
      // Không lọc gì cả
    } else if (statusFilter === 'Rejected') {
      if (transfusion.status !== 'Rejected' && transfusion.status !== 'Cancelled') {
        return false;
      }
    } else {
      if (transfusion.status !== statusFilter) {
        return false;
      }
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
        setMembers((resMembers.data || []).filter(m => m.isRecipient === true));
        console.log("Fetched members for dropdown:", resMembers.data); // Debug log
        // Lấy danh sách nhóm máu
        const resBloodTypes = await axios.get("/api/BloodType", { headers: { Authorization: `Bearer ${token}` } });
        setBloodTypes(resBloodTypes.data || []);
        // console.log("Fetched blood types:", resBloodTypes.data); // Debug log
        // Lấy danh sách thành phần máu
        const resBloodComponents = await axios.get("/api/BloodComponent", { headers: { Authorization: `Bearer ${token}` } });
        setBloodComponents(resBloodComponents.data || []);
        console.log("Blood components loaded:", resBloodComponents.data);
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


  const navigate = useNavigate();

  // Thêm hàm chuyển tab sang tìm kiếm máu (nếu có props hoặc context), hoặc mở dialog tạo yêu cầu huy động máu
  const handleConnectDonor = () => {
    navigate("/blood-search");

  };

  return (
    <Box {...layoutProps} sx={{ backgroundColor: "#fff", minHeight: "100vh", ...layoutProps?.sx }}>
      {/* Bộ lọc trạng thái dạng Paper giống DonationRequestManagement */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'All' ? '2px solid #9e9e9e' : '1px solid #e0e0e0', boxShadow: statusFilter === 'All' ? 4 : 1 }}
          onClick={() => setStatusFilter('All')}
          elevation={statusFilter === 'All' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Tất cả</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.length}</Typography>
          <Chip label="Tất cả" sx={{ mt: 1, backgroundColor: '#9e9e9e', color: 'white' }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Approved' ? '2px solid #ed6c02' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Approved' ? 4 : 1 }}
          onClick={() => setStatusFilter('Approved')}
          elevation={statusFilter === 'Approved' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã duyệt</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Approved').length}</Typography>
          <Chip label="Đã duyệt" color="warning" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Completed' ? '2px solid #2e7d32' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Completed' ? 4 : 1 }}
          onClick={() => setStatusFilter('Completed')}
          elevation={statusFilter === 'Completed' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Hoàn thành</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Completed').length}</Typography>
          <Chip label="Hoàn thành" color="success" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: (statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? '2px solid #d32f2f' : '1px solid #e0e0e0', boxShadow: (statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? 4 : 1 }}
          onClick={() => setStatusFilter('Rejected')}
          elevation={(statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã từ chối/Hủy</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length}</Typography>
          <Chip label="Đã từ chối/Hủy" color="error" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Pending' ? '2px solid #795548' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Pending' ? 4 : 1 }}
          onClick={() => setStatusFilter('Pending')}
          elevation={statusFilter === 'Pending' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Chờ duyệt</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Pending').length}</Typography>
          <Chip label="Chờ duyệt" sx={{ mt: 1, backgroundColor: '#795548', color: 'white' }} />
        </Paper>
      </Box>
      {/* Bộ lọc ngày và nút tạo mới giữ nguyên */}
      <Card sx={{ mb: 2, p: 2, boxShadow: 'none', background: 'none' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', justifyContent: 'flex-start' }}>
          {/* Date Range Filter */}
          <TextField
            label="Từ ngày"
            type="date"
            value={dateFilter.startDate || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
            inputProps={{ max: dateFilter.endDate || undefined }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            value={dateFilter.endDate || ''}
            onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
            InputLabelProps={{ shrink: true }}
            sx={{ minWidth: 150 }}
            inputProps={{ min: dateFilter.startDate || undefined }}
          />
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
          {showCreateButton && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenCreateDialog(true)}
            >
              Tạo yêu cầu truyền máu
            </Button>
          )}
        </Box>
      </Card>

      {/* Bảng truyền máu */}
      <Card sx={{ boxShadow: 'none', background: 'none' }}>
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
                        {/* Đã xóa hiển thị cân nặng và chiều cao ở danh sách ngoài */}
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
                          {transfusion.responsibleByName || 'Chưa rõ'}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary" fontStyle="italic">
                          Chưa phân công
                        </Typography>
                      )}
                    </TableCell>
                    {/* Trạng thái */}
                    <TableCell>
                      <Chip 
                        label={transfusionStatusTranslations[transfusion?.status] || transfusion?.status} 
                        color={getStatusColor(transfusion?.status)} 
                        size="small"
                        sx={
                          transfusion?.status === 'Pending' ? { backgroundColor: '#795548', color: 'white' } :
                          transfusion?.status === 'Cancelled' ? { backgroundColor: '#795548', color: 'white' } :
                          undefined
                        }
                      />
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
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleOpenApproveDialog(transfusion); }}
                                disabled={loading}
                              >
                                Duyệt
                              </Button>
                            </Tooltip>
                          )}
                          {transfusion.status === "Approved" && (
                            <Tooltip title="Hoàn thành yêu cầu">
                              <Button
                                variant="contained"
                                color="primary"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleOpenCompleteDialog(transfusion); }}
                                disabled={loading}
                              >
                                Hoàn thành
                              </Button>
                            </Tooltip>
                          )}
                          {(transfusion.status === "Pending" || transfusion.status === "Approved") && (
                            <Tooltip title="Hủy yêu cầu">
                              <Button
                                variant="outlined"
                                color="warning"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleOpenCancelDialog(transfusion); }}
                                disabled={loading}
                              >
                                Hủy
                              </Button>
                            </Tooltip>
                          )}
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
            {/* Danh sách máu phù hợp từ API suitable */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Chọn các túi máu phù hợp (cộng dồn đủ {requiredVolume}ml):</Typography>
            {suitableBloodUnits.length === 0 ? (
              <>
                <Typography color="error" sx={{ mb: 2 }}>
                  Không có túi máu phù hợp trong kho!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleConnectDonor}
                  sx={{ mb: 2, alignSelf: 'flex-start' }}
                >

                  Tìm người hiến phù hợp

                </Button>
              </>
            ) : (
              <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                {suitableBloodUnits.map(unit => {
                  const selected = approveSelectedUnits.find(u => u.bloodUnitId === unit.bloodUnitId);
                  return (
                    <Box key={unit.bloodUnitId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <input
                        type="checkbox"
                        checked={!!selected}
                        onChange={() => handleSelectBloodUnit(unit.bloodUnitId, unit.remainingVolume)}
                      />
                      <Typography variant="body2">
                        {unit.BloodTypeName || unit.bloodTypeName || 'N/A'}
                        {" | "}
                        {bloodComponentTranslations[unit.ComponentName || unit.componentName] || unit.ComponentName || unit.componentName || 'N/A'}
                        {" | ID: "}{unit.bloodUnitId}
                        {" | Lượng còn lại: "}{unit.remainingVolume}ml
                        {" | HSD: "}{formatDateTime(unit.expiryDate)}
                      </Typography>
                      {selected && (
                        <TextField
                          type="number"
                          size="small"
                          value={selected.volume}
                          onChange={e => handleChangeUnitVolume(unit.bloodUnitId, e.target.value, unit.remainingVolume)}
                          inputProps={{ min: 1, max: unit.remainingVolume, style: { width: 70 } }}
                          sx={{ ml: 1 }}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
            <Typography variant="body2" sx={{ mt: 1 }}>
              Tổng dung tích đã chọn: <strong>{totalSelectedVolume} ml</strong> / Yêu cầu: <strong>{requiredVolume} ml</strong>
            </Typography>
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
            disabled={suitableBloodUnits.length === 0 || approveSelectedUnits.length === 0 || totalSelectedVolume < requiredVolume || approveLoading}
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
                <Typography variant="body2" color="text.secondary">Cân nặng: {selectedTransfusionForDetails.weight ? `${selectedTransfusionForDetails.weight} kg` : 'N/A'}</Typography>
                <Typography variant="body2" color="text.secondary">Chiều cao: {selectedTransfusionForDetails.height ? `${selectedTransfusionForDetails.height} cm` : 'N/A'}</Typography>
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
                <Typography variant="subtitle2" color="text.secondary">Tên người phụ trách:</Typography>
                <Typography variant="body1" fontWeight="medium">{selectedTransfusionForDetails.responsibleByName || 'Chưa rõ'}</Typography>
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
                `${option.fullName || ''}${option.citizenNumber ? ` (CCCD: ${option.citizenNumber})` : ''}`.trim()
              }
              filterOptions={filterOptions}
              value={members.find(m => m.userId === createForm.MemberId) || null}
              onChange={(event, newValue) => {
                console.log('Chọn người nhận:', newValue);
                console.log('BloodTypeId sẽ set:', newValue && newValue.bloodTypeId ? newValue.bloodTypeId : '');
                setCreateForm(prevForm => ({
                  ...prevForm,
                  MemberId: newValue ? newValue.userId : "",
                  BloodTypeId: newValue && newValue.bloodTypeId ? newValue.bloodTypeId : "",
                  BloodComponentId: "",
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
              onChange={e => {

                let value = e.target.value.replace(/[^0-9]/g, '');
                // Giới hạn lượng máu nếu thành phần là Hồng cầu, Huyết tương, Tiểu cầu
                const selectedComponent = bloodComponents.find(bc => String(bc.componentId) === String(createForm.BloodComponentId));
                const limitedComponents = ["Red Blood Cells", "Plasma", "Platelets"];
                if (selectedComponent && limitedComponents.includes(selectedComponent.componentName)) {
                  if (value !== '' && Number(value) > 300) {
                    value = '300';
                    setCreateFormError("Lượng máu tối đa cho thành phần này là 300ml");
                  } else {
                    setCreateFormError("");
                  }
                } else {
                  setCreateFormError("");
                }
                setCreateForm({ ...createForm, TransfusionVolume: value });
              }}
              required
              type="number"
              inputProps={{ min: 1, max: (() => {
                const selectedComponent = bloodComponents.find(bc => String(bc.componentId) === String(createForm.BloodComponentId));
                const limitedComponents = ["Red Blood Cells", "Plasma", "Platelets"];
                if (selectedComponent && limitedComponents.includes(selectedComponent.componentName)) {
                  return 300;
                }
                return undefined;
              })() }}
              error={!!createFormError}
              helperText={createFormError}
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
              if (Number(createForm.TransfusionVolume) > 300) {
                setSnackbar({ open: true, message: "Số lượng máu tối đa là 300ml!", severity: "error" });
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

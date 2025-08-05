// ===== IMPORTS =====
// React core và hooks
import React, { useState, useEffect, useCallback } from "react";

// Material-UI components cho UI
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
  Checkbox,
} from "@mui/material";

// Material-UI icons
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Bloodtype as BloodIcon,
} from "@mui/icons-material";

// Form handling và validation
import { useFormik } from "formik";
import * as Yup from "yup";

// Redux state management
import { useSelector } from 'react-redux';
import { selectUser } from '../features/auth/authSlice';

// HTTP client cho API calls
import axios from "axios";

// Material-UI Autocomplete cho dropdown search
import { Autocomplete, createFilterOptions } from "@mui/material";

// React Router cho navigation
import { useNavigate } from "react-router-dom";

// ===== CUSTOM HOOK: QUẢN LÝ STATE VÀ API CHO TRUYỀN MÁU =====
// Hook này thay thế useTransfusionStore bằng kết nối API thật và bổ sung các trường mới
const useTransfusionStore = () => {
  // ===== STATE MANAGEMENT =====
  const [transfusions, setTransfusions] = useState([]); // Danh sách yêu cầu truyền máu
  const [loading, setLoading] = useState(false);        // Trạng thái loading
  const [error, setError] = useState(null);             // Lỗi nếu có

  // ===== EFFECT: FETCH DỮ LIỆU BAN ĐẦU =====
  useEffect(() => {
    console.count('useTransfusionStore useEffect');
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy token từ localStorage để xác thực
        const token = localStorage.getItem("token");
        
        // Gọi API lấy danh sách yêu cầu truyền máu
        const res = await axios.get("/api/TransfusionRequest", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        // Cập nhật state với dữ liệu từ API
        setTransfusions(res.data);
        console.log("Fetched transfusions:", res.data); // Debug log
      } catch (err) {
        // Xử lý lỗi khi không thể lấy dữ liệu
        setError("Không thể lấy dữ liệu truyền máu!");
      } finally {
        // Luôn tắt loading sau khi hoàn thành
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== FUNCTION: CẬP NHẬT YÊU CẦU TRUYỀN MÁU =====
  const updateTransfusion = useCallback(async (id, data) => {
    console.count('updateTransfusion useCallback');
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Gọi API cập nhật yêu cầu truyền máu
      await axios.patch(`/api/TransfusionRequest/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Sau khi cập nhật, reload lại danh sách để đồng bộ dữ liệu
      const res = await axios.get("/api/TransfusionRequest", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfusions(res.data);
      return { success: true };
    } catch (err) {
      // Xử lý lỗi khi cập nhật thất bại
      setError("Cập nhật trạng thái truyền máu thất bại!");
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  // ===== FUNCTION: RELOAD DỮ LIỆU TRUYỀN MÁU =====
  // Thêm hàm reloadTransfusions để refresh dữ liệu khi cần
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

// ===== MAIN COMPONENT: QUẢN LÝ TRUYỀN MÁU =====
// Component chính để quản lý các yêu cầu truyền máu
// Props:
// - onApprovalComplete: Callback khi hoàn thành duyệt
// - showOnlyPending: Chỉ hiển thị yêu cầu đang chờ
// - showOnlyApproved: Chỉ hiển thị yêu cầu đã duyệt
// - showCreateButton: Hiển thị nút tạo mới
// - layoutProps: Props cho layout
const TransfusionManagement = ({ onApprovalComplete, showOnlyPending = false, showOnlyApproved = false, showCreateButton = false, layoutProps = {} }) => {
  // ===== REDUX STATE =====
  const user = useSelector(selectUser); // Lấy thông tin user từ Redux store
  
  // ===== CUSTOM HOOK STATE =====
  const { transfusions, loading, error, updateTransfusion, clearError, reloadTransfusions } = useTransfusionStore();
  
  // ===== DIALOG STATES =====
  // Dialog chỉnh sửa yêu cầu truyền máu
  const [editDialog, setEditDialog] = useState({
    open: false,
    transfusion: null,
  });
  
  // ===== NOTIFICATION STATE =====
  // Snackbar để hiển thị thông báo
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  
  // ===== CREATE DIALOG STATES =====
  // Dialog tạo yêu cầu truyền máu mới
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [createForm, setCreateForm] = useState({
    MemberId: "",           // ID thành viên
    BloodTypeId: "",        // ID nhóm máu
    BloodComponentId: "",   // ID chế phẩm máu
    TransfusionVolume: "",  // Thể tích truyền
    PreferredReceiveDate: "", // Ngày nhận dự kiến
    Notes: "",              // Ghi chú
  });
  const [createFormError, setCreateFormError] = useState(""); // Lỗi form tạo mới
  const [createLoading, setCreateLoading] = useState(false);  // Loading khi tạo
  const [newlyCreatedId, setNewlyCreatedId] = useState(null); // Track ID yêu cầu vừa tạo
  
  // ===== FILTER STATES =====
  const [statusFilter, setStatusFilter] = useState("All"); // Filter theo trạng thái
  const [dateFilter, setDateFilter] = useState({ startDate: null, endDate: null }); // Filter theo khoảng thời gian
  
  // ===== DROPDOWN DATA STATES =====
  const [members, setMembers] = useState([]);        // Danh sách thành viên
  const [bloodTypes, setBloodTypes] = useState([]);  // Danh sách nhóm máu
  const [bloodComponents, setBloodComponents] = useState([]); // Danh sách chế phẩm máu

  // ===== DETAIL DIALOG STATES =====
  // Dialog hiển thị chi tiết yêu cầu truyền máu
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedTransfusionForDetails, setSelectedTransfusionForDetails] = useState(null);

  // ===== APPROVE DIALOG STATES =====
  // Dialog duyệt yêu cầu truyền máu và chọn máu
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [transfusionToApprove, setTransfusionToApprove] = useState(null);
  const [approveSelectedUnits, setApproveSelectedUnits] = useState([]); // [{bloodUnitId, volume}] - Danh sách máu đã chọn
  const [approveNotes, setApproveNotes] = useState(""); // Ghi chú khi duyệt
  const [approveLoading, setApproveLoading] = useState(false); // Loading khi duyệt
  const [suitableBloodUnits, setSuitableBloodUnits] = useState([]); // Danh sách máu phù hợp từ API
  // State cho suitable alternatives - máu tương thích thay thế
  const [suitableAlternatives, setSuitableAlternatives] = useState([]);
  // Thêm state cho danh sách người hiến phù hợp
  const [eligibleDonors, setEligibleDonors] = useState([]);
  const [selectedDonors, setSelectedDonors] = useState([]); // Lưu email người được chọn
  const [emailSending, setEmailSending] = useState(false);
  const [emailOption, setEmailOption] = useState("all"); // "all" hoặc "selected"

  // ===== COMPLETE DIALOG STATES =====
  // Dialog hoàn thành yêu cầu truyền máu
  const [openCompleteDialog, setOpenCompleteDialog] = useState(false);
  const [transfusionToComplete, setTransfusionToComplete] = useState(null);
  const [completeLoading, setCompleteLoading] = useState(false);

  // ===== CANCEL DIALOG STATES =====
  // Dialog hủy yêu cầu truyền máu
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [transfusionToCancel, setTransfusionToCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // ===== TRANSLATION OBJECTS =====
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
    "Approved": "Đã gán",
    "Pending": "Chờ gán",
    "Completed": "Hoàn thành",
    "Cancelled": "Đã hủy",
    "Rejected": "Từ chối",
  };

  // Danh sách các trạng thái có thể có
  const statusOptions = ["Approved", "Pending", "Completed", "Cancelled", "Rejected"]; // Cập nhật để khớp với BE

  // ===== HELPER FUNCTIONS =====
  
  // Hàm lấy màu cho từng trạng thái
  const getStatusColor = (status) => {
    // Màu giống DonationRequestManagement.js
    const colors = {
      "Approved": "warning", // Đã gán - cam
      "Pending": "default", // Chờ gán - nâu
      "Completed": "success", // Hoàn thành - xanh lá
      "Cancelled": "error", // Đã hủy - đỏ
      "Rejected": "error", // Đã từ chối - đỏ
    };
    return colors[status] || "default";
  };

  // Hàm format ngày giờ theo định dạng Việt Nam
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // ===== FORMIK VALIDATION =====
  // Schema validation cho form chỉnh sửa
  const validationSchema = Yup.object({
    ResponsibleById: Yup.number().nullable(),
    Status: Yup.string().oneOf(statusOptions).required("Status is required"),
    Notes: Yup.string().max(500, "Notes must be less than 500 characters"),
  });

  // Formik instance cho form chỉnh sửa
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

  // ===== DIALOG HANDLERS =====
  
  // Hàm mở dialog chỉnh sửa
  const handleEditClick = (transfusion) => {
    formik.setValues({
      Status: transfusion.status,
      Notes: transfusion.notes || "",
    });
    setEditDialog({ open: true, transfusion });
  };

  // Hàm đóng dialog chỉnh sửa
  const handleCloseDialog = () => {
    setEditDialog({ open: false, transfusion: null });
    formik.resetForm();
  };

  // ===== APPROVE DIALOG HANDLERS =====
  
  // Hàm mở dialog duyệt yêu cầu truyền máu
  const handleOpenApproveDialog = async (transfusion) => {
    setTransfusionToApprove(transfusion);
    setOpenApproveDialog(true);
    setApproveSelectedUnits([]);
    setApproveNotes("");
    setEligibleDonors([]); // reset trước khi gọi API
    // Gọi API mới tìm máu phù hợp
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/TransfusionRequest/suitable-blood-types`, {
        params: {
          bloodTypeId: transfusion.bloodTypeId,    // Nhóm máu cần truyền
          componentId: transfusion.componentId,    // Chế phẩm máu cần truyền
          requiredVolume: transfusion.transfusionVolume // Thể tích cần thiết
        },
        headers: { Authorization: `Bearer ${token}` },
      });
      // Xử lý response từ API suitable-blood-types (hỗ trợ cả camelCase và PascalCase)
      setSuitableBloodUnits(res.data.ExactMatch || res.data.exactMatch || []);
      const compatible = res.data.CompatibleMatch || res.data.compatibleMatch || [];
      if (Array.isArray(compatible) && compatible.length > 0) {
        const grouped = {};
        compatible.forEach(unit => {
          const key = unit.BloodTypeName || unit.bloodTypeName;
          if (!grouped[key]) grouped[key] = { BloodTypeName: key, units: [], totalAvailable: 0 };
          grouped[key].units.push(unit);
          grouped[key].totalAvailable += unit.RemainingVolume || unit.remainingVolume || 0;
        });
        setSuitableAlternatives(Object.values(grouped));
      } else {
        setSuitableAlternatives([]);
      }
      setEligibleDonors(res.data.EligibleDonors || res.data.eligibleDonors || []);
    } catch (err) {
      setSuitableBloodUnits([]);
      setSuitableAlternatives([]);
      setEligibleDonors([]);
    }
  };

  // Hàm đóng dialog duyệt
  const handleCloseApproveDialog = () => {
    setOpenApproveDialog(false);
    setTransfusionToApprove(null);
    setApproveSelectedUnits([]);
    setApproveNotes("");
    setSuitableBloodUnits([]);
    setSuitableAlternatives([]);
  };

  // ===== BLOOD UNIT SELECTION HANDLERS =====
  
  // Hàm chọn máu (multi-select, cộng dồn thể tích)
  // bloodUnitId: ID của đơn vị máu
  // maxVolume: Thể tích tối đa có thể lấy từ đơn vị máu này
  const handleSelectBloodUnit = (bloodUnitId, maxVolume) => {
    // Nếu đã chọn thì bỏ chọn, chưa chọn thì thêm với volume mặc định maxVolume
    setApproveSelectedUnits(prev => {
      const exists = prev.find(u => u.bloodUnitId === bloodUnitId);
      if (exists) {
        // Nếu đã chọn thì bỏ chọn (toggle)
        return prev.filter(u => u.bloodUnitId !== bloodUnitId);
      } else {
        // Nếu chưa chọn thì thêm vào danh sách với thể tích mặc định
        return [...prev, { bloodUnitId, volume: maxVolume }];
      }
    });
  };

  // Hàm thay đổi thể tích lấy từ từng túi máu
  // bloodUnitId: ID của đơn vị máu
  // value: Giá trị thể tích mới
  // maxVolume: Thể tích tối đa có thể lấy
  const handleChangeUnitVolume = (bloodUnitId, value, maxVolume) => {
    let v = value === "" ? "" : parseInt(value);
    // Đảm bảo không vượt quá thể tích tối đa
    if (v !== "" && v > maxVolume) v = maxVolume;
    // Cập nhật thể tích cho đơn vị máu được chọn
    setApproveSelectedUnits(prev => prev.map(u => u.bloodUnitId === bloodUnitId ? { ...u, volume: v } : u));
  };

  // ===== VOLUME CALCULATIONS =====
  
  // Tổng thể tích đã chọn từ các đơn vị máu
  const totalSelectedVolume = approveSelectedUnits.reduce((sum, u) => sum + u.volume, 0);
  
  // Thể tích cần thiết cho yêu cầu truyền máu
  const requiredVolume = transfusionToApprove?.transfusionVolume || 0;
  
  // Tổng thể tích có sẵn (máu đúng nhóm + máu tương thích)
  const totalAvailableVolume = suitableBloodUnits.reduce((sum, u) => sum + u.remainingVolume, 0) + 
                              suitableAlternatives.reduce((sum, alt) => sum + (alt.totalAvailable || 0), 0);
  
  // Kiểm tra có đơn vị máu nào phù hợp không
  const hasAnyUnits = suitableBloodUnits.length > 0 || suitableAlternatives.length > 0;

  // ===== APPROVE CONFIRMATION HANDLER =====
  
  // Hàm xác nhận duyệt yêu cầu truyền máu
  const handleConfirmApprove = async () => {
    setApproveLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Tạo payload cho API approve
      const payload = {
        bloodUnits: approveSelectedUnits.map(u => ({ 
          bloodUnitId: u.bloodUnitId, 
          volumeUsed: u.volume 
        })),
        notes: approveNotes || null,
      };
      
      console.log("[APPROVE] PATCH payload:", payload);
      
      // Gọi API duyệt yêu cầu truyền máu
      await axios.patch(`/api/TransfusionRequest/${transfusionToApprove.transfusionId}/approve`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToApprove.transfusionId} đã được gán!`,
        severity: "success",
      });
      
      // Đóng dialog và reload dữ liệu
      handleCloseApproveDialog();
      if (onApprovalComplete) {
        onApprovalComplete();
      }
      await reloadTransfusions();
    } catch (err) {
      // Xử lý lỗi khi duyệt thất bại
      let errorMessage = "Gán yêu cầu thất bại.";
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

  // ===== COMPLETE DIALOG HANDLERS =====
  
  // Hàm mở dialog hoàn thành yêu cầu truyền máu
  const handleOpenCompleteDialog = (transfusion) => {
    setTransfusionToComplete(transfusion);
    setOpenCompleteDialog(true);
  };

  // Hàm đóng dialog hoàn thành
  const handleCloseCompleteDialog = () => {
    setOpenCompleteDialog(false);
    setTransfusionToComplete(null);
  };

  // Hàm xác nhận hoàn thành yêu cầu truyền máu
  const handleConfirmComplete = async () => {
    setCompleteLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Gọi API hoàn thành yêu cầu truyền máu
      await axios.patch(`/api/TransfusionRequest/${transfusionToComplete.transfusionId}/complete`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToComplete.transfusionId} đã hoàn thành!`,
        severity: "success",
      });
      
      // Đóng dialog và reload dữ liệu
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

  // ===== CANCEL DIALOG HANDLERS =====
  
  // Hàm mở dialog hủy yêu cầu truyền máu
  const handleOpenCancelDialog = (transfusion) => {
    setTransfusionToCancel(transfusion);
    setOpenCancelDialog(true);
  };

  // Hàm đóng dialog hủy
  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setTransfusionToCancel(null);
  };

  // Hàm xác nhận hủy yêu cầu truyền máu
  const handleConfirmCancel = async () => {
    setCancelLoading(true);
    try {
      const token = localStorage.getItem("token");
      
      // Gọi API hủy yêu cầu truyền máu
      await axios.patch(`/api/TransfusionRequest/${transfusionToCancel.transfusionId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Hiển thị thông báo thành công
      setSnackbar({
        open: true,
        message: `Yêu cầu ${transfusionToCancel.transfusionId} đã hủy!`,
        severity: "success",
      });
      
      // Đóng dialog và reload dữ liệu
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

  // ===== EXPIRED CHECK HANDLER =====
  
  // Hàm kiểm tra yêu cầu truyền máu hết hạn
  // Tự động hủy các yêu cầu đã quá hạn
  const handleExpiredCheck = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Gọi API kiểm tra và cập nhật yêu cầu hết hạn
      const response = await axios.patch(`/api/TransfusionRequest/expired_check`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // Hiển thị thông báo kết quả
      if (response.data && response.data.expiredCount > 0) {
        setSnackbar({
          open: true,
          message: `Đã cập nhật ${response.data.expiredCount} yêu cầu truyền máu hết hạn!`,
          severity: "warning",
        });
      } else {
        setSnackbar({
          open: true,
          message: "Không có yêu cầu truyền máu nào hết hạn!",
          severity: "info",
        });
      }
      
      // Reload danh sách sau khi kiểm tra
      await reloadTransfusions();
    } catch (err) {
      console.error("Error checking expired transfusion requests:", err);
      const errorMessage = err.response?.data?.message || "Kiểm tra yêu cầu hết hạn thất bại.";
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: "error",
      });
    }
  };

  // ===== STATISTICS HELPER =====
  
  // Hàm tính toán thống kê theo trạng thái
  const getStatistics = () => {
    return statusOptions.map((status) => ({
      status,
      count: transfusions.filter((t) => t.status === status).length,
    }));
  };

  // ===== FILTERING LOGIC =====
  
  // Filter transfusions based on status and date
  // Lọc danh sách yêu cầu truyền máu theo trạng thái và ngày tháng
  const filteredTransfusions = transfusions.filter(transfusion => {
    // Show only pending if specified
    // Chỉ hiển thị yêu cầu đang chờ nếu được chỉ định
    if (showOnlyPending && transfusion.status !== "Pending") {
      return false;
    }
    
    // Show only approved if specified
    // Chỉ hiển thị yêu cầu đã duyệt nếu được chỉ định
    if (showOnlyApproved && transfusion.status !== "Approved") {
      return false;
    }
    
    // Filter by status
    // Lọc theo trạng thái
    if (statusFilter === 'All') {
      // Không lọc gì cả
    } else if (statusFilter === 'Rejected') {
      // Nhóm "Từ chối" bao gồm cả Rejected và Cancelled
      if (transfusion.status !== 'Rejected' && transfusion.status !== 'Cancelled') {
        return false;
      }
    } else {
      // Lọc theo trạng thái cụ thể
      if (transfusion.status !== statusFilter) {
        return false;
      }
    }
    
    // Filter by date range
    // Lọc theo khoảng thời gian
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

  // ===== USE EFFECT: FETCH DROPDOWN DATA =====
  
  // Effect để lấy dữ liệu cho các dropdown khi component mount
  useEffect(() => {
    console.count('TransfusionManagement useEffect');
    const fetchDataForDropdowns = async () => {
      const token = localStorage.getItem("token");
      try {
        // Lấy danh sách member (chỉ những người có thể nhận máu)
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

  // ===== DETAIL DIALOG HANDLERS =====
  
  // Hàm xử lý khi click vào row để xem chi tiết
  const handleRowClick = async (transfusion) => {
    try {
      const token = localStorage.getItem("token");
      
      // Gọi API lấy chi tiết yêu cầu truyền máu
      const res = await axios.get(`/api/TransfusionRequest/${transfusion.transfusionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const detail = res.data;
      console.log('[DEBUG] Chi tiết yêu cầu truyền máu từ API:', detail);
      
      // Kiểm tra và log thông tin máu được gán
      if (detail.BloodUnits || detail.bloodUnits) {
        console.log('[DEBUG] BloodUnits:', detail.BloodUnits || detail.bloodUnits);
      } else {
        console.log('[DEBUG] Không có trường BloodUnits trong dữ liệu chi tiết!');
      }
      
      // Cập nhật state và mở dialog chi tiết
      setSelectedTransfusionForDetails(detail);
      setOpenDetailDialog(true);
    } catch (err) {
      console.error("Lỗi khi lấy chi tiết yêu cầu truyền máu:", err);
    }
  };

  // Hàm đóng dialog chi tiết
  const handleCloseDetailDialog = () => {
    setOpenDetailDialog(false);
    setSelectedTransfusionForDetails(null);
  };

  // ===== AUTOCOMPLETE FILTER CONFIGURATION =====
  
  // Filter options for Autocomplete (cho phép tìm kiếm theo FullName, CitizenNumber, Email, PhoneNumber)
  const filterOptions = createFilterOptions({
    matchFrom: 'any',
    limit: 100, // Tăng giới hạn kết quả trả về để đảm bảo tìm thấy
    stringify: (option) => `${
      option.fullName || ''       
    } ${option.citizenNumber || ''} ${option.email || ''} ${option.phoneNumber || ''}`,
  });

  const navigate = useNavigate();

  // ===== NAVIGATION HANDLER =====
  
  // Thêm hàm chuyển tab sang tìm kiếm máu (nếu có props hoặc context), hoặc mở dialog tạo yêu cầu huy động máu
  const handleConnectDonor = () => {
    navigate("/blood-search");
  };

  const handleSendEmail = async () => {
    setEmailSending(true);
    try {
      let emails = [];
      if (emailOption === "all") {
        emails = eligibleDonors.map(d => d.email).filter(Boolean);
      } else {
        emails = selectedDonors;
      }
      if (emails.length === 0) {
        setSnackbar({ open: true, message: "Chưa chọn người nhận email!", severity: "warning" });
        setEmailSending(false);
        return;
      }
      await axios.post("/api/TransfusionRequest/send-email-donor", {
        transfusionRequestId: transfusionToApprove?.transfusionId,
        email: emails
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSnackbar({ open: true, message: "Đã gửi email thành công!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: "Gửi email thất bại!", severity: "error" });
    }
    setEmailSending(false);
  };

  // ===== JSX RENDER =====
  
  return (
    <React.Fragment>
      {/* ===== STATUS FILTER SECTION ===== */}
      {/* Bộ lọc trạng thái dạng Paper giống DonationRequestManagement */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Tất cả */}
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'All' ? '2px solid #9e9e9e' : '1px solid #e0e0e0', boxShadow: statusFilter === 'All' ? 4 : 1 }}
          onClick={() => setStatusFilter('All')}
          elevation={statusFilter === 'All' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Tất cả</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.length}</Typography>
          <Chip label="Tất cả" sx={{ mt: 1, backgroundColor: '#9e9e9e', color: 'white' }} />
        </Paper>
        
        {/* Đã gán */}
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Approved' ? '2px solid #ed6c02' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Approved' ? 4 : 1 }}
          onClick={() => setStatusFilter('Approved')}
          elevation={statusFilter === 'Approved' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã gán</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Approved').length}</Typography>
          <Chip label="Đã gán" color="warning" sx={{ mt: 1 }} />
        </Paper>
        
        {/* Hoàn thành */}
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Completed' ? '2px solid #2e7d32' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Completed' ? 4 : 1 }}
          onClick={() => setStatusFilter('Completed')}
          elevation={statusFilter === 'Completed' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Hoàn thành</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Completed').length}</Typography>
          <Chip label="Hoàn thành" color="success" sx={{ mt: 1 }} />
        </Paper>
        
        {/* Đã từ chối/Hủy */}
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: (statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? '2px solid #d32f2f' : '1px solid #e0e0e0', boxShadow: (statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? 4 : 1 }}
          onClick={() => setStatusFilter('Rejected')}
          elevation={(statusFilter === 'Rejected' || statusFilter === 'Cancelled') ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã từ chối/Hủy</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length}</Typography>
          <Chip label="Đã từ chối/Hủy" color="error" sx={{ mt: 1 }} />
        </Paper>
        
        {/* Chờ gán */}
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Pending' ? '2px solid #795548' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Pending' ? 4 : 1 }}
          onClick={() => setStatusFilter('Pending')}
          elevation={statusFilter === 'Pending' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Chờ gán</Typography>
          <Typography variant="h4" fontWeight="bold">{transfusions.filter(r => r.status === 'Pending').length}</Typography>
          <Chip label="Chờ gán" sx={{ mt: 1, backgroundColor: '#795548', color: 'white' }} />
        </Paper>
      </Box>
      
      {/* ===== FILTER AND ACTION SECTION ===== */}
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
                  case 'all':
                    setDateFilter({
                      startDate: null,
                      endDate: null
                    });
                    break;
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
              <MenuItem value="all">Tất cả</MenuItem>
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
          <Button
            variant="outlined"
            color="warning"
            onClick={handleExpiredCheck}
            sx={{ ml: 1 }}
          >
            Kiểm tra hết hạn
          </Button>
        </Box>
      </Card>

      {/* Bảng truyền máu */}
      <Box>
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
          <TableContainer component={Box} variant="outlined" sx={{
            overflowX: 'auto', // Chỉ cuộn ngang nếu bảng rộng
            width: '100%',
            maxWidth: '100%',
            px: 0,
            border: '1px solid #e0e0e0',
            borderRadius: 2,
            background: '#fff'
          }}>
            <Table sx={{ width: '100%' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 110, minWidth: 60, maxWidth: 130, padding: '4px 8px' }}>Thông tin truyền máu</TableCell>
                  <TableCell sx={{ width: 100, minWidth: 60, maxWidth: 120, padding: '4px 8px' }}>Người nhận</TableCell>
                  <TableCell sx={{ width: 100, minWidth: 60, maxWidth: 120, padding: '4px 8px' }}>Chi tiết máu</TableCell>
                  <TableCell sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>Ngày giờ</TableCell>
                  <TableCell sx={{ width: 80, minWidth: 60, maxWidth: 100, padding: '4px 8px' }}>Trạng thái</TableCell>
                  <TableCell sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>Tình trạng bệnh nhân</TableCell>
                  <TableCell align="center" sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>Hành động</TableCell>
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
                    <TableCell sx={{ width: 110, minWidth: 60, maxWidth: 130, padding: '4px 8px' }}>
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
                    <TableCell sx={{ width: 100, minWidth: 60, maxWidth: 120, padding: '4px 8px' }}>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {transfusion?.fullName}
                        </Typography>
                        {/* Đã xóa hiển thị cân nặng và chiều cao ở danh sách ngoài */}
                      </Box>
                    </TableCell>
                    {/* Chi tiết máu */}
                    <TableCell sx={{ width: 100, minWidth: 60, maxWidth: 120, padding: '4px 8px' }}>
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
                    <TableCell sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>
                  <Box>
                    {transfusion?.requestDate ? (
                      <>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Ngày tạo yêu cầu: {new Date(transfusion?.requestDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          {new Date(transfusion?.requestDate).toLocaleDateString('vi-VN')}
                        </Typography>
                        {transfusion?.preferredReceiveDate && (
                          <Typography component="span" variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                            (Ngày truyền máu: {new Date(transfusion?.preferredReceiveDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} {new Date(transfusion?.preferredReceiveDate).toLocaleDateString('vi-VN')})
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="caption" color="text.secondary">N/A</Typography>
                    )}
                  </Box>
                </TableCell>
                    {/* Trạng thái */}
                    <TableCell sx={{ width: 80, minWidth: 60, maxWidth: 100, padding: '4px 8px' }}>
                      <Chip 
                        label={transfusionStatusTranslations[transfusion?.status] || transfusion?.status} 
                        color={getStatusColor(transfusion?.status)} 
                        size="small"
                        sx={
                          transfusion?.status === 'Pending' ? { backgroundColor: '#795548', color: 'white' } :
                          undefined
                        }
                      />
                    </TableCell>
                    {/* Tình trạng bệnh nhân */}
                    <TableCell sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>
                      {transfusion.patientCondition || <span style={{ fontStyle: "italic", color: "gray" }}>Không có</span>}
                    </TableCell>
                    {/* Hành động */}
                    <TableCell align="center" sx={{ width: 90, minWidth: 60, maxWidth: 110, padding: '4px 8px' }}>
                      {user && (user.role === "Staff" || user.role === "Admin") && (
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          {transfusion.status === "Pending" && (
                            <Tooltip title="Gán yêu cầu">
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={(e) => { e.stopPropagation(); handleOpenApproveDialog(transfusion); }}
                                disabled={loading}
                              >
                                Gán
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
        </Box>

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

      {/* Dialog Gán yêu cầu truyền máu */}
      <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} maxWidth="md" fullWidth>
                  <DialogTitle>Gán máu cho yêu cầu #{transfusionToApprove?.transfusionId}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography variant="body1">
              Người nhận: <strong>{transfusionToApprove?.fullName}</strong>
            </Typography>
            <Typography variant="body1">
              Yêu cầu: <strong>{transfusionToApprove?.transfusionVolume} ml {bloodComponentTranslations[transfusionToApprove?.componentName] || transfusionToApprove?.componentName} ({transfusionToApprove?.bloodTypeName})</strong>
            </Typography>
            {/* Danh sách máu phù hợp từ API suitable */}
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
  Chọn các túi máu phù hợp (cộng dồn đủ {requiredVolume}ml):
</Typography>
{(!hasAnyUnits || totalAvailableVolume < requiredVolume) ? (
  <>
    <Typography color="error" sx={{ mb: 2 }}>
      Không có túi máu phù hợp trong kho!
    </Typography>
    {eligibleDonors.length > 0 && (
      <Box sx={{ mt: 3, border: '1px solid #eee', borderRadius: 1, p: 2 }}>
        {/* UI chọn chế độ gửi email và nút gửi */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl>
            <Select
              value={emailOption}
              onChange={e => setEmailOption(e.target.value)}
              size="small"
            >
              <MenuItem value="all">Gửi cho tất cả người hiến phù hợp</MenuItem>
              <MenuItem value="selected">Gửi cho từng người được chọn</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            disabled={emailSending || (emailOption === "selected" && selectedDonors.length === 0)}
            onClick={handleSendEmail}
          >
            {emailSending ? "Đang gửi..." : "Gửi email"}
          </Button>
        </Box>
        <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
          Danh sách người hiến phù hợp:
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                {emailOption === "selected" && <TableCell padding="checkbox"></TableCell>}
                <TableCell>Họ tên</TableCell>
                <TableCell>Nhóm máu</TableCell>
                <TableCell>Số điện thoại</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Lần hiến gần nhất</TableCell>
                <TableCell>Số lần hiến</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {eligibleDonors.map((donor, idx) => (
                <TableRow key={donor.userId || idx}>
                  {emailOption === "selected" && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDonors.includes(donor.email)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedDonors(prev => [...prev, donor.email]);
                          } else {
                            setSelectedDonors(prev => prev.filter(email => email !== donor.email));
                          }
                        }}
                        disabled={emailOption !== "selected"}
                      />
                    </TableCell>
                  )}
                  <TableCell>{donor.donorName}</TableCell>
                  <TableCell>{donor.bloodTypeName}</TableCell>
                  <TableCell>{donor.phoneNumber}</TableCell>
                  <TableCell>{donor.email}</TableCell>
                  <TableCell>{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString('vi-VN') : 'Chưa hiến'}</TableCell>
                  <TableCell>{donor.donationCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    )}
  </>
) : (
  <>
    {/* Đúng nhóm máu, máu chính xác */}
                {suitableBloodUnits.length > 0 && (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1, mb: 2 }}>
                    <Typography variant="subtitle2" color="primary">Túi máu đúng nhóm:</Typography>
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
                {/* Các nhóm máu tương thích khác */}
                {/* Hiển thị các nhóm máu tương thích khác nếu có */} 
                {suitableAlternatives.length > 0 && (
                  <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                    <Typography variant="subtitle2" color="secondary">Các nhóm máu tương thích khác:</Typography>
                    {/* Duyệt qua từng nhóm máu tương thích */} 

                    {suitableAlternatives.map(alt => (
                      <Box key={alt.BloodTypeId} sx={{ mb: 2 }}>
                        {/* Hiển thị tên nhóm máu và tổng lượng máu có sẵn */} 

                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          {/* Duyệt qua từng đơn vị máu trong nhóm máu tương thích */} 

                          {alt.BloodTypeName} (Tổng: {alt.totalAvailable}ml)
                        </Typography>
                        {alt.units.map(unit => {
                          {/* Kiểm tra xem đơn vị máu đã được chọn chưa */} 

                          const selected = approveSelectedUnits.find(u => u.bloodUnitId === unit.bloodUnitId);
                          return (
                            <Box key={unit.bloodUnitId} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, ml: 2 }}>
                              {/* Checkbox để chọn đơn vị máu */} 
                              <input
                                type="checkbox"
                                checked={!!selected}
                                onChange={() => handleSelectBloodUnit(unit.bloodUnitId, unit.remainingVolume)}
                              />
                              {/* Thông tin chi tiết đơn vị máu */} 
                              <Typography variant="body2">
                                {unit.BloodTypeName || unit.bloodTypeName || 'N/A'}
                                {" | "}
                                {bloodComponentTranslations[unit.ComponentName || unit.componentName] || unit.ComponentName || unit.componentName || 'N/A'}
                                {" | ID: "}{unit.bloodUnitId}
                                {" | Lượng còn lại: "}{unit.remainingVolume}ml
                                {" | HSD: "}{formatDateTime(unit.expiryDate)}
                              </Typography>
                              {/* Input để điều chỉnh thể tích nếu đơn vị máu được chọn */} 
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
                    ))}
                  </Box>
                )}

            <Typography variant="body2" sx={{ mt: 1 }}>
              Tổng dung tích đã chọn: <strong>{totalSelectedVolume} ml</strong> / Yêu cầu: <strong>{requiredVolume} ml</strong>
            </Typography>
            <TextField
                              label="Ghi chú gán (Tùy chọn)"
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            {/* Danh sách người hiến phù hợp */}
            {eligibleDonors.length > 0 && (
              <Box sx={{ mt: 3, border: '1px solid #eee', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" color="info.main" sx={{ mb: 1 }}>
                  Danh sách người hiến phù hợp:
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {emailOption === "selected" && <TableCell padding="checkbox"></TableCell>}
                        <TableCell>Họ tên</TableCell>
                        <TableCell>Nhóm máu</TableCell>
                        <TableCell>Số điện thoại</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Lần hiến gần nhất</TableCell>
                        <TableCell>Số lần hiến</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eligibleDonors.map((donor, idx) => (
                        <TableRow key={donor.userId || idx}>
                          {emailOption === "selected" && (
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedDonors.includes(donor.email)}
                                onChange={e => {
                                  if (e.target.checked) {
                                    setSelectedDonors(prev => [...prev, donor.email]);
                                  } else {
                                    setSelectedDonors(prev => prev.filter(email => email !== donor.email));
                                  }
                                }}
                                disabled={emailOption !== "selected"}
                              />
                            </TableCell>
                          )}
                          <TableCell>{donor.donorName}</TableCell>
                          <TableCell>{donor.bloodTypeName}</TableCell>
                          <TableCell>{donor.phoneNumber}</TableCell>
                          <TableCell>{donor.email}</TableCell>
                          <TableCell>{donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString('vi-VN') : 'Chưa hiến'}</TableCell>
                          <TableCell>{donor.donationCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </>
        )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseApproveDialog} disabled={approveLoading}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleConfirmApprove}
            disabled={approveSelectedUnits.length === 0 || totalSelectedVolume < requiredVolume || approveLoading}
          >
                            {approveLoading ? "Đang gán..." : "Gán"}
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
            Nếu yêu cầu đã được gán, đơn vị máu đã đặt chỗ sẽ được giải phóng.
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
            <>
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
                  <Typography variant="subtitle2" color="text.secondary">Ngày tạo yêu cầu:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.requestDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Ngày truyền máu:</Typography>
                  <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.preferredReceiveDate) || 'Chưa có'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary">Trạng thái:</Typography>
                  <Typography variant="body1" fontWeight="medium">
                    <Chip label={transfusionStatusTranslations[selectedTransfusionForDetails.status] || selectedTransfusionForDetails.status} color={getStatusColor(selectedTransfusionForDetails.status)} size="small" />
                  </Typography>
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
                                <Typography variant="subtitle2" color="text.secondary">Ngày gán:</Typography>
              <Typography variant="body1" fontWeight="medium">{formatDateTime(selectedTransfusionForDetails.approvalDate) || 'Chưa gán'}</Typography>
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
              {/* Hiển thị danh sách các đơn vị máu đã truyền/gán nếu có */}
              {(() => {
                const bloodUnits = selectedTransfusionForDetails.BloodUnits || selectedTransfusionForDetails.bloodUnits || [];
                return bloodUnits.length > 0 && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" color="primary" gutterBottom>Danh sách đơn vị máu đã truyền</Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Thể tích truyền (ml)</TableCell>
                            <TableCell>Ngày truyền</TableCell>
                            <TableCell>Nhóm máu</TableCell>
                            <TableCell>Thành phần</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {bloodUnits.map((unit, idx) => (
                            <TableRow key={unit.BloodUnitId || unit.bloodUnitId || idx}>
                              <TableCell>{unit.BloodUnitId || unit.bloodUnitId}</TableCell>
                              <TableCell>{unit.AssignedVolume || unit.assignedVolume}</TableCell>
                              <TableCell>{unit.AssignedDate ? formatDateTime(unit.AssignedDate) : (unit.assignedDate ? formatDateTime(unit.assignedDate) : '')}</TableCell>
                              <TableCell>{unit.BloodUnit?.BloodTypeName || unit.bloodUnit?.bloodTypeName || unit.BloodUnit?.bloodTypeName || ''}</TableCell>
                              <TableCell>{bloodComponentTranslations[unit.BloodUnit?.ComponentName || unit.bloodUnit?.componentName || unit.BloodUnit?.componentName] || unit.BloodUnit?.ComponentName || unit.bloodUnit?.componentName || unit.BloodUnit?.componentName || ''}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                );
              })()}
            </>
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
              onOpen={() => {
                console.log('[DEBUG] Danh sách members hiển thị gợi ý:', members);
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
                label="Nhóm máu"
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
                label="Thành phần máu"
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
              label="Ngày truyền máu"
              type="datetime-local"
              value={createForm.PreferredReceiveDate}
              onChange={e => setCreateForm({ ...createForm, PreferredReceiveDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              inputProps={{ 
                min: new Date().toISOString().slice(0, 16) // Không cho chọn ngày trong quá khứ
              }}
              helperText={
                <>Chọn ngày và giờ truyền máu<br/><span style={{color:'#888'}}>Định dạng: tháng/ngày/năm giờ:phút (AM/PM). Ví dụ: 08/05/2025 08:00 AM</span></>
              }
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
              // Lấy thành phần máu đã chọn
              const selectedComponent = bloodComponents.find(bc => String(bc.componentId) === String(createForm.BloodComponentId));
              const limitedComponents = ["Red Blood Cells", "Plasma", "Platelets"];
              if (selectedComponent && limitedComponents.includes(selectedComponent.componentName)) {
                if (Number(createForm.TransfusionVolume) > 300) {
                  setSnackbar({ open: true, message: "Số lượng máu tối đa cho thành phần này là 300ml!", severity: "error" });
                  return;
                }
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
                  preferredReceiveDate: createForm.PreferredReceiveDate ? new Date(createForm.PreferredReceiveDate).toISOString() : null,
                  patientCondition: ""
                }, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                
                // Track newly created request ID
                const newRequestId = response.data.transfusionId;
                setNewlyCreatedId(newRequestId);
                
                setSnackbar({ open: true, message: "Tạo yêu cầu truyền máu thành công!", severity: "success" });
                setOpenCreateDialog(false);
                setCreateForm({ MemberId: "", BloodTypeId: "", BloodComponentId: "", TransfusionVolume: "", PreferredReceiveDate: "", Notes: "" });
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
    </React.Fragment>
  );
};

export default TransfusionManagement;

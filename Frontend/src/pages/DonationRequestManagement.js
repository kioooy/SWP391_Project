import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Grid,
  Container,
} from '@mui/material';
import FilterIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import axios from 'axios';
import dayjs from 'dayjs';
import HealthSurveyReview from '../components/HealthSurveyReview';

// Danh sách nhóm máu để cập nhật
const bloodTypes = [
  { id: 1, label: 'A+' },
  { id: 2, label: 'A-' },
  { id: 3, label: 'B+' },
  { id: 4, label: 'B-' },
  { id: 5, label: 'AB+' },
  { id: 6, label: 'AB-' },
  { id: 7, label: 'O+' },
  { id: 8, label: 'O-' },
];

const DonationRequestManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
       // Bộ lọc states
  const [filters, setFilters] = useState({
    status: '',
    bloodType: '',
    patientName: '',
    dateFrom: '',
    dateTo: '',
    type: '' // 'All', 'Urgent', 'Regular'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [filteredRequests, setFilteredRequests] = useState([]);

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(''); // 'Approve' or 'Reject'
  const [notes, setNotes] = useState('');

  // Thêm dialog xác nhận hoàn thành/hủy
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [actionRequest, setActionRequest] = useState(null);
  const [actionMode, setActionMode] = useState(''); // 'complete' hoặc 'cancel'

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Thêm dialog hiển thị PatientCondition
  const [openPatientCondition, setOpenPatientCondition] = useState(false);

  // Thêm dialog cập nhật nhóm máu
  const [openBloodTypeDialog, setOpenBloodTypeDialog] = useState(false);
  const [newBloodTypeId, setNewBloodTypeId] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      // Gọi API tự động hủy các yêu cầu quá hạn trước khi lấy danh sách
      try {
        await axios.patch('/api/DonationRequest/expired_check', {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (expiredErr) {
        // Không cần xử lý lỗi, chỉ log nếu muốn
        console.warn('Không thể tự động hủy các yêu cầu quá hạn:', expiredErr);
      }
      const response = await axios.get('/api/DonationRequest', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
      setFilteredRequests(response.data); // Khởi tạo dữ liệu đã lọc
      setError('');
    } catch (err) {
      console.error('Error fetching donation requests:', err);
      setError('Không thể lấy dữ liệu yêu cầu hiến máu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleOpenDialog = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRequest(null);
    setNotes('');
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !user) return;
    try {
      const token = localStorage.getItem('token');
      const reason = notes.trim() ? notes : 'Yêu cầu bị từ chối bởi nhân viên';
      await axios.patch(`/api/DonationRequest/${selectedRequest.donationId}/reject?note=${encodeURIComponent(reason)}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(
        requests.map((req) =>
          req.donationId === selectedRequest.donationId
            ? { ...req, status: 'Rejected', notes: reason }
            : req
        )
      );
      handleCloseDialog();
      setSnackbar({ open: true, message: 'Yêu cầu đã bị từ chối.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Từ chối yêu cầu thất bại!', severity: 'error' });
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !user) return;
    try {
      const token = localStorage.getItem('token');
      const noteValue = notes?.trim() || 'Đã duyệt bởi nhân viên';
      await axios.patch(`/api/DonationRequest/${selectedRequest.donationId}/approved?note=${encodeURIComponent(noteValue)}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(
        requests.map((req) =>
          req.donationId === selectedRequest.donationId
            ? { ...req, status: 'Approved' }
            : req
        )
      );
      handleCloseDialog();
      setSnackbar({ open: true, message: 'Yêu cầu đã được duyệt.', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Duyệt yêu cầu thất bại!', severity: 'error' });
    }
  };

  const handleOpenActionDialog = (request, mode) => {
    // Kiểm tra nếu là hoàn thành và nhóm máu "Không biết"
    if (mode === 'complete') {
      console.log('Checking blood type for request:', request);
      console.log('BloodTypeId:', request.bloodTypeId, 'Type:', typeof request.bloodTypeId);
      console.log('BloodTypeName:', request.bloodTypeName, 'Type:', typeof request.bloodTypeName);
      
      // Kiểm tra nhiều trường hợp có thể của "Không biết"
      const bloodTypeId = parseInt(request.bloodTypeId);
      const isValidBloodTypeId = bloodTypeId >= 1 && bloodTypeId <= 8;
      
      const isUnknownBloodType = 
        request.bloodTypeId === 99 || 
        request.bloodTypeId === '99' ||
        request.bloodTypeId === null ||
        request.bloodTypeId === undefined ||
        !isValidBloodTypeId ||
        request.bloodTypeName === 'Không biết' ||
        request.bloodTypeName === 'Không Biết' ||
        request.bloodTypeName === 'không biết' ||
        request.bloodTypeName === null ||
        request.bloodTypeName === undefined ||
        request.bloodTypeName === '' ||
        request.bloodTypeName?.toLowerCase().includes('không biết') ||
        request.bloodTypeName?.toLowerCase().includes('không');
        
      console.log('Is unknown blood type:', isUnknownBloodType);
        
      if (isUnknownBloodType) {
        setSelectedRequest(request);
        // Tự động chọn nhóm máu hiện tại nếu có
        let defaultBloodTypeId = '';
        
        // Thử lấy từ bloodTypeId trước
        const currentBloodTypeId = parseInt(request.bloodTypeId);
        if (currentBloodTypeId >= 1 && currentBloodTypeId <= 8) {
          defaultBloodTypeId = currentBloodTypeId.toString();
        } else {
          // Nếu bloodTypeId không hợp lệ, thử map từ bloodTypeName
          const bloodTypeMap = {
            'A+': '1', 'A-': '2', 'B+': '3', 'B-': '4',
            'AB+': '5', 'AB-': '6', 'O+': '7', 'O-': '8'
          };
          if (request.bloodTypeName && bloodTypeMap[request.bloodTypeName]) {
            defaultBloodTypeId = bloodTypeMap[request.bloodTypeName];
          }
        }
        
        setNewBloodTypeId(defaultBloodTypeId);
        setOpenBloodTypeDialog(true);
        return;
      }
    }
    
    setActionRequest({
      ...request,
      notes: "", // Luôn để trống khi mở dialog hoàn thành/hủy
    });
    setActionMode(mode);
    setOpenActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setActionRequest(null);
    setActionMode('');
  };

  const handleCloseBloodTypeDialog = () => {
    setOpenBloodTypeDialog(false);
    setSelectedRequest(null);
    setNewBloodTypeId('');
  };

  const handleUpdateBloodTypeAndComplete = async () => {
    if (!selectedRequest || !newBloodTypeId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn nhóm máu!', severity: 'warning' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // 1. Cập nhật nhóm máu cho member
      await axios.patch(`/api/User/${selectedRequest.memberId}/blood-type`, {
        BloodTypeId: parseInt(newBloodTypeId)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 2. Hoàn thành yêu cầu hiến máu
      await axios.patch(`/api/DonationRequest/${selectedRequest.donationId}/update-completed`, {
        MemberId: selectedRequest.memberId,
        Status: 'Completed',
        Notes: `Đã cập nhật nhóm máu: ${bloodTypes.find(bt => bt.id == newBloodTypeId)?.label}`,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Cập nhật UI tạm thời
      const updatedBloodTypeName = bloodTypes.find(bt => bt.id == newBloodTypeId)?.label;
      setRequests(
        requests.map((req) =>
          req.donationId === selectedRequest.donationId
            ? { 
                ...req, 
                status: 'Completed',
                bloodTypeName: updatedBloodTypeName,
                bloodTypeId: newBloodTypeId,
                notes: `Đã cập nhật nhóm máu: ${updatedBloodTypeName}`
              }
            : req
        )
      );

      setSnackbar({ 
        open: true, 
        message: 'Đã hoàn thành và cập nhật nhóm máu thành công!', 
        severity: 'success' 
      });

    } catch (err) {
      let message = 'Có lỗi xảy ra khi cập nhật!';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        }
      }
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      handleCloseBloodTypeDialog();
    }
  };

  const handleConfirmActionRequest = async () => {
    if (!actionRequest) return;
    const token = localStorage.getItem('token');
    if (!actionRequest.donationId || isNaN(actionRequest.donationId)) {
      setSnackbar({ open: true, message: 'ID yêu cầu không hợp lệ!', severity: 'error' });
      handleCloseActionDialog();
      return;
    }
    try {
      if (actionMode === 'complete') {
        await axios.patch(`/api/DonationRequest/${actionRequest.donationId}/update-completed`, {
          MemberId: actionRequest.memberId,
          Status: 'Completed',
          Notes: actionRequest.notes || '',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(
          requests.map((req) =>
            req.donationId === actionRequest.donationId
              ? { ...req, status: 'Completed' }
              : req
          )
        );
        setSnackbar({ open: true, message: 'Đã hoàn thành yêu cầu!', severity: 'success' });
      } else if (actionMode === 'cancel') {
        await axios.patch(`/api/DonationRequest/${actionRequest.donationId}/cancel`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(
          requests.map((req) =>
            req.donationId === actionRequest.donationId
              ? { ...req, status: 'Cancelled', notes: actionRequest.notes || 'Đã hủy bởi nhân viên' }
              : req
          )
        );
        setSnackbar({ open: true, message: 'Yêu cầu đã được hủy.', severity: 'success' });
      }
    } catch (err) {
      let message = 'Có lỗi xảy ra!';
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          message = err.response.data;
        } else if (err.response.data.message) {
          message = err.response.data.message;
        } else if (err.response.data.error) {
          message = err.response.data.error;
        }
      }
      setSnackbar({ open: true, message, severity: 'error' });
    } finally {
      handleCloseActionDialog();
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Đã duyệt" color="warning" />;
      case 'Pending':
        return <Chip label="Chờ duyệt" sx={{ backgroundColor: '#FF9800', color: 'white' }} />;
      case 'Rejected':
        return <Chip label="Đã từ chối" color="error" />;
      case 'Cancelled':
        return <Chip label="Đã hủy" sx={{ backgroundColor: '#795548', color: 'white' }} />;
      case 'Completed':
        return <Chip label="Hoàn Thành" color="success" />;
      default:
        return <Chip label={status} />;
    }
  };

       // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    let filtered = [...requests];

    // Sắp xếp: ưu tiên khẩn cấp lên đầu, sau đó theo ID mới nhất
    filtered = filtered.sort((a, b) => {
      if (a.isUrgent && !b.isUrgent) return -1;
      if (!a.isUrgent && b.isUrgent) return 1;
      return (b.donationId || 0) - (a.donationId || 0);
    });

    // Lọc theo trạng thái
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    // Lọc theo nhóm máu
    if (filters.bloodType) {
      filtered = filtered.filter(req => req.bloodTypeName === filters.bloodType);
    }

    // Lọc theo tên người hiến
    if (filters.patientName) {
      filtered = filtered.filter(req => 
        (req.fullName || req.memberName || '').toLowerCase().includes(filters.patientName.toLowerCase())
      );
    }

    // Lọc theo ngày bắt đầu
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(req => new Date(req.preferredDonationDate) >= fromDate);
    }

    // Lọc theo ngày kết thúc
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Cuối ngày
      filtered = filtered.filter(req => new Date(req.preferredDonationDate) <= toDate);
    }

    // Lọc theo loại hiến máu
    if (filters.type) {
      if (filters.type === 'Urgent') {
        filtered = filtered.filter(req => req.isUrgent);
      } else if (filters.type === 'Regular') {
        filtered = filtered.filter(req => !req.isUrgent);
      }
    }

    setFilteredRequests(filtered);
  };

  // Hàm xóa bộ lọc
  const clearFilters = () => {
    setFilters({
      status: '',
      bloodType: '',
      patientName: '',
      dateFrom: '',
      dateTo: '',
      type: ''
    });
  };

  // Hàm cập nhật filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Áp dụng bộ lọc khi filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  // Tính toán số lượng từng trạng thái
  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Approved').length;
  const completedCount = requests.filter(r => r.status === 'Completed').length;
  const rejectedCount = requests.filter(r => r.status === 'Rejected' || r.status === 'Cancelled').length;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: '#E53935' }}>
        Quản Lý Yêu Cầu Hiến Máu
      </Typography>

       {/* Cảnh báo cho yêu cầu khẩn cấp */}
       {requests.filter(r => r.isUrgent && (r.status === 'Pending' || r.status === 'Approved')).length > 0 && (
         <Alert 
           severity="error" 
           sx={{ mb: 3, border: '2px solid #d32f2f' }}
           icon={<span style={{ fontSize: '1.5rem' }}>🚨</span>}
         >
           <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
             ⚠️ CÓ {requests.filter(r => r.isUrgent && (r.status === 'Pending' || r.status === 'Approved')).length} YÊU CẦU HIẾN MÁU KHẨN CẤP CẦN XỬ LÝ NGAY!
           </Typography>
           <Typography variant="body2">
             Vui lòng ưu tiên xử lý các yêu cầu hiến máu khẩn cấp trước để đảm bảo an toàn cho bệnh nhân.
           </Typography>
         </Alert>
       )}

      {/* Hướng dẫn xử lý đơn hiến máu */}
      <Paper sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa' }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, color: '#1976d2' }}>
          Hướng dẫn xử lý đơn hiến máu dành cho nhân viên y tế
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Bước</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd' }}>Nội dung</TableCell>
                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#e3f2fd', textAlign: 'center' }}>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>1. Tiếp nhận</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ mb: 1 }}>• Xác minh thông tin người hiến</Typography>
                  <Typography variant="body2">• Kiểm tra thông tin sức khỏe</Typography>
                  <Typography variant="body2">• Hướng dẫn xét nghiệm máu lâm sàng</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Chip label="Đã duyệt" color="warning" size="small" sx={{ minWidth: 120 }} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>2. Duyệt yêu cầu</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ mb: 1 }}>• Nếu đạt yêu cầu → chọn Duyệt</Typography>
                  <Typography variant="body2">• Nếu không đạt → chọn Từ chối</Typography>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Chip label="Duyệt" color="success" size="small" sx={{ minWidth: 120 }} />
                    <Chip label="Từ chối" color="error" size="small" sx={{ minWidth: 120 }} />
                  </Box>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', verticalAlign: 'top' }}>3. Hoàn thành hiến máu</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ mb: 1 }}>• Nếu đã hiến máu thành công → chọn Hoàn thành</Typography>
                  <Typography variant="body2">• Nếu có sự cố trong quá trình lấy máu → chọn Hủy, ghi rõ lý do</Typography>
              
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'center' }}>
                    <Chip label="Hoàn thành" color="success" size="small" sx={{ minWidth: 120 }} />
                    <Chip label="Từ chối" color="error" size="small" sx={{ minWidth: 120 }} />
                  </Box>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>



       {/* Bộ lọc */}
       <Card sx={{ mb: 3 }}>
         <CardContent>
           <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <FilterIcon /> Bộ lọc
             </Typography>
             <Box sx={{ display: 'flex', gap: 1 }}>
               <Button
                 variant="outlined"
                 size="small"
                 onClick={() => setShowFilters(!showFilters)}
                 startIcon={<FilterIcon />}
               >
                 {showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}
               </Button>
               <Button
                 variant="outlined"
                 size="small"
                 color="error"
                 onClick={clearFilters}
                 startIcon={<ClearIcon />}
                 disabled={!filters.status && !filters.bloodType && !filters.patientName && !filters.dateFrom && !filters.dateTo && !filters.type}
               >
                 Xóa bộ lọc
               </Button>
             </Box>
           </Box>

           {showFilters && (
             <Grid container spacing={2}>
               <Grid item xs={12} sm={6} md={2}>
                 <FormControl fullWidth size="small">
                   <InputLabel>Trạng thái</InputLabel>
                   <Select
                     value={filters.status}
                     onChange={(e) => updateFilter('status', e.target.value)}
                     label="Trạng thái"
                   >
                     <MenuItem value="">Tất cả</MenuItem>
                     <MenuItem value="Pending">Chờ duyệt</MenuItem>
                     <MenuItem value="Approved">Đã duyệt</MenuItem>
                     <MenuItem value="Completed">Hoàn thành</MenuItem>
                     <MenuItem value="Rejected">Đã từ chối</MenuItem>
                     <MenuItem value="Cancelled">Đã hủy</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               <Grid item xs={12} sm={6} md={2}>
                 <FormControl fullWidth size="small">
                   <InputLabel>Nhóm máu</InputLabel>
                   <Select
                     value={filters.bloodType}
                     onChange={(e) => updateFilter('bloodType', e.target.value)}
                     label="Nhóm máu"
                   >
                     <MenuItem value="">Tất cả</MenuItem>
                     <MenuItem value="A+">A+</MenuItem>
                     <MenuItem value="A-">A-</MenuItem>
                     <MenuItem value="B+">B+</MenuItem>
                     <MenuItem value="B-">B-</MenuItem>
                     <MenuItem value="AB+">AB+</MenuItem>
                     <MenuItem value="AB-">AB-</MenuItem>
                     <MenuItem value="O+">O+</MenuItem>
                     <MenuItem value="O-">O-</MenuItem>
                     <MenuItem value="Không biết">Không biết</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               <Grid item xs={12} sm={6} md={2}>
                 <FormControl fullWidth size="small">
                   <InputLabel>Loại hiến máu</InputLabel>
                   <Select
                     value={filters.type}
                     onChange={(e) => updateFilter('type', e.target.value)}
                     label="Loại hiến máu"
                   >
                     <MenuItem value="">Tất cả</MenuItem>
                     <MenuItem value="Urgent">Khẩn cấp</MenuItem>
                     <MenuItem value="Regular">Thường</MenuItem>
                   </Select>
                 </FormControl>
               </Grid>

               <Grid item xs={12} sm={6} md={3}>
                 <TextField
                   fullWidth
                   size="small"
                   label="Tên người hiến"
                   value={filters.patientName}
                   onChange={(e) => updateFilter('patientName', e.target.value)}
                   placeholder="Nhập tên để tìm kiếm..."
                 />
               </Grid>

               <Grid item xs={12} sm={6} md={1.5}>
                 <TextField
                   fullWidth
                   size="small"
                   label="Từ ngày"
                   type="date"
                   value={filters.dateFrom}
                   onChange={(e) => updateFilter('dateFrom', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
               </Grid>

               <Grid item xs={12} sm={6} md={1.5}>
                 <TextField
                   fullWidth
                   size="small"
                   label="Đến ngày"
                   type="date"
                   value={filters.dateTo}
                   onChange={(e) => updateFilter('dateTo', e.target.value)}
                   InputLabelProps={{ shrink: true }}
                 />
               </Grid>
             </Grid>
           )}

           <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <Typography variant="body2" color="text.secondary">
               Hiển thị {filteredRequests.length} / {requests.length} yêu cầu
             </Typography>
             {(filters.status || filters.bloodType || filters.patientName || filters.dateFrom || filters.dateTo || filters.type) && (
               <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                 {filters.status && (
                   <Chip 
                     label={`Trạng thái: ${filters.status}`} 
                     size="small" 
                     onDelete={() => updateFilter('status', '')} 
                   />
                 )}
                 {filters.bloodType && (
                   <Chip 
                     label={`Nhóm máu: ${filters.bloodType}`} 
                     size="small" 
                     onDelete={() => updateFilter('bloodType', '')} 
                   />
                 )}
                 {filters.type && (
                   <Chip 
                     label={`Loại: ${filters.type === 'Urgent' ? 'Khẩn cấp' : 'Thường'}`} 
                     size="small" 
                     onDelete={() => updateFilter('type', '')} 
                   />
                 )}
                 {filters.patientName && (
                   <Chip 
                     label={`Tìm kiếm: ${filters.patientName}`} 
                     size="small" 
                     onDelete={() => updateFilter('patientName', '')} 
                   />
                 )}
                 {filters.dateFrom && (
                   <Chip 
                     label={`Từ: ${filters.dateFrom}`} 
                     size="small" 
                     onDelete={() => updateFilter('dateFrom', '')} 
                   />
                 )}
                 {filters.dateTo && (
                   <Chip 
                     label={`Đến: ${filters.dateTo}`} 
                     size="small" 
                     onDelete={() => updateFilter('dateTo', '')} 
                   />
                 )}
      </Box>
             )}
           </Box>
         </CardContent>
       </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

             <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, mt: 3 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: '8%' }}>ID</TableCell>
                <TableCell sx={{ width: '15%' }}>Họ tên</TableCell>
                <TableCell sx={{ width: '12%' }}>Số CCCD</TableCell>
                <TableCell sx={{ width: '10%' }}>Nhóm máu</TableCell>
                <TableCell sx={{ width: '12%' }}>Lượng máu (ml)</TableCell>
                <TableCell sx={{ width: '10%' }}>Ngày hẹn</TableCell>
                 <TableCell sx={{ width: '12%' }}>Loại hiến máu</TableCell>
                 <TableCell sx={{ width: '13%' }}>Đợt hiến máu</TableCell>
                <TableCell sx={{ width: '10%' }}>Trạng thái</TableCell>
                <TableCell sx={{ width: '8%' }}>Ghi chú</TableCell>
                <TableCell sx={{ width: '10%' }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.donationId} hover>
                  <TableCell sx={{ width: '8%' }}>{req.donationId}</TableCell>
                  <TableCell sx={{ width: '15%', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                    {req.fullName || req.memberName}
                  </TableCell>
                  <TableCell sx={{ width: '12%' }}>{req.citizenNumber}</TableCell>
                <TableCell sx={{ width: '10%' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {req.bloodTypeName}
                    {(req.bloodTypeId === 99 || req.bloodTypeName === 'Không biết') && (
                      <Chip 
                        label="⚠️" 
                        color="warning" 
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                </TableCell>
                <TableCell sx={{ width: '12%' }}>
                  {req.donationVolume ? `${req.donationVolume} ml` : 'Chưa xác định'}
                </TableCell>
                <TableCell sx={{ width: '10%' }}>
                  {dayjs(req.preferredDonationDate).format('DD/MM/YYYY')}
                </TableCell>
                 <TableCell sx={{ width: '12%' }}>
                   {req.isUrgent ? (
                     <Chip 
                       label="🚨 KHẨN CẤP" 
                       color="error" 
                       size="small"
                       sx={{ 
                         fontSize: '0.7rem', 
                         height: '20px',
                         fontWeight: 'bold',
                         backgroundColor: '#d32f2f',
                         color: 'white'
                       }}
                     />
                   ) : (
                     <Chip 
                       label="THƯỜNG" 
                       sx={{ 
                         fontSize: '0.7rem', 
                         height: '20px',
                         fontWeight: 'bold',
                         backgroundColor: '#4caf50',
                         color: 'white'
                       }}
                     />
                   )}
                 </TableCell>
                   <TableCell sx={{ width: '13%' }}>
                    {req.isUrgent ? (
                      req.periodId && req.periodName ? (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Chip 
                            label="🚨 KHẨN CẤP" 
                            color="error" 
                            size="small"
                            sx={{ 
                              fontSize: '0.7rem', 
                              height: '20px',
                              fontWeight: 'bold',
                              backgroundColor: '#d32f2f',
                              color: 'white'
                            }}
                          />
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', color: '#d32f2f', fontWeight: 'bold' }}>
                            Hiến máu khẩn cấp
                          </Typography>
                      <Button 
                        variant="outlined" 
                        size="small" 
                            sx={{ fontSize: '0.7rem', height: '24px', borderColor: '#d32f2f', color: '#d32f2f' }}
                        onClick={() => { setSelectedRequest(req); setOpenPatientCondition(true); }}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                      ) : null
                    ) : (
                      req.periodId && req.periodName ? (
                        <>
                          <Typography variant="body2" sx={{ fontSize: '0.8rem', mb: 0.5 }}>
                            {`${req.periodId} - ${req.periodName}`}
                          </Typography>
                          <Button 
                            variant="outlined" 
                            size="small" 
                            sx={{ fontSize: '0.7rem', height: '24px' }}
                            onClick={() => { setSelectedRequest(req); setOpenPatientCondition(true); }}
                          >
                            Chi tiết
                          </Button>
                        </>
                      ) : null
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '10%' }}>{getStatusChip(req.status)}</TableCell>
                  <TableCell sx={{ width: '8%', wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '0' }}>
                    {req.status === 'Cancelled' && req.notes ? <b>{req.notes}</b> : req.notes}
                  </TableCell>
                  <TableCell sx={{ width: '10%' }}>
                    {req.status === 'Pending' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          sx={{ fontSize: '0.8rem', height: '32px', minWidth: '80px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenDialog(req, 'Approve')}
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="medium"
                          sx={{ fontSize: '0.8rem', height: '32px', minWidth: '80px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenDialog(req, 'Reject')}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                    {req.status === 'Approved' && (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="medium"
                          sx={{ fontSize: '0.8rem', height: '32px', minWidth: '80px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenActionDialog(req, 'complete')}
                        >
                          Hoàn thành
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="medium"
                          sx={{ fontSize: '0.8rem', height: '32px', minWidth: '80px', whiteSpace: 'nowrap' }}
                          onClick={() => handleOpenDialog(req, 'Reject')}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>
          Xác nhận {actionType === 'Approve' ? 'Duyệt' : 'Từ chối'} yêu cầu
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn {actionType === 'Approve' ? 'duyệt' : 'từ chối'} yêu cầu hiến máu
            này không?{(actionType === 'Reject' || actionType === 'Approve') ? ' Vui lòng thêm ghi chú (nếu cần).' : ''}
          </DialogContentText>
          {(actionType === 'Reject' || actionType === 'Approve') && (
            <TextField
              autoFocus
              margin="dense"
              label="Ghi chú"
              type="text"
              fullWidth
              variant="standard"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={actionType === 'Approve' ? 'Ghi chú khi duyệt (tùy chọn)' : 'Lý do từ chối (nếu cần)'}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          {actionType === 'Reject' ? (
            <Button onClick={handleRejectRequest} variant="contained" color="error">
              Từ chối
            </Button>
          ) : actionType === 'Approve' ? (
            <Button onClick={handleApproveRequest} variant="contained" color="success">
              Duyệt
            </Button>
          ) : (
            <Button onClick={handleCloseDialog} variant="contained">
              Xác nhận
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận hoàn thành/hủy */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog}>
        <DialogTitle>
          {actionMode === 'complete' ? 'Xác nhận hoàn thành yêu cầu' : 'Xác nhận từ chối yêu cầu'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn {actionMode === 'complete' ? 'đánh dấu hoàn thành' : 'từ chối'} yêu cầu này không?
          </DialogContentText>
          {actionMode === 'complete' && (
            <TextField
              margin="dense"
              label="Ghi chú (nếu cần)"
              type="text"
              fullWidth
              variant="standard"
              value={actionRequest?.notes || ''}
              onChange={e =>
                setActionRequest((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Hủy</Button>
          <Button
            onClick={handleConfirmActionRequest}
            variant="contained"
            color={actionMode === 'complete' ? 'success' : 'error'}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog cập nhật nhóm máu */}
      <Dialog open={openBloodTypeDialog} onClose={handleCloseBloodTypeDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ 
          bgcolor: 'warning.light', 
          color: 'warning.contrastText',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          ⚠️ Xác nhận nhóm máu trước khi hoàn thành
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              <strong>Người hiến:</strong> {selectedRequest?.fullName || selectedRequest?.memberName}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              <strong>CCCD:</strong> {selectedRequest?.citizenNumber}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Nhóm máu hiện tại:</strong>
            </Typography>
              <Chip 
                label={selectedRequest?.bloodTypeName || 'Không biết'} 
                color={selectedRequest?.bloodTypeName && selectedRequest?.bloodTypeName !== 'Không biết' ? 'primary' : 'warning'} 
                size="small" 
              />
            </Box>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Vui lòng cập nhật nhóm máu chính xác từ kết quả xét nghiệm trước khi hoàn thành yêu cầu hiến máu.
          </Alert>

          <FormControl fullWidth variant="outlined">
            <InputLabel>Nhóm máu (*)</InputLabel>
            <Select
              value={newBloodTypeId}
              onChange={(e) => setNewBloodTypeId(e.target.value)}
              label="Nhóm máu (*)"
            >
              {bloodTypes.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={handleCloseBloodTypeDialog}
            variant="outlined"
          >
            Hủy
          </Button>
          <Button 
            onClick={handleUpdateBloodTypeAndComplete}
            variant="contained"
            color="success"
            disabled={!newBloodTypeId}
            sx={{ minWidth: 180 }}
          >
            Cập nhật & Hoàn thành
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog hiển thị PatientCondition */}
      {openPatientCondition && selectedRequest && (
        <Dialog open={openPatientCondition} onClose={() => setOpenPatientCondition(false)} maxWidth="md" fullWidth>
          <DialogTitle>Chi tiết sức khỏe</DialogTitle>
          <DialogContent dividers>
            {(() => {
              let data = selectedRequest.patientCondition || selectedRequest.PatientCondition;
              let parsed = null;
              try {
                parsed = typeof data === 'string' ? JSON.parse(data) : data;
              } catch (e) { parsed = null; }
              if (parsed && typeof parsed === 'object') {
                return <HealthSurveyReview formData={parsed} />;
              }
              // Nếu không parse được thì hiển thị dạng text, mỗi mục một dòng và chuyển mã số thành mô tả
              if (typeof data === 'string') {
                const codeMap = {
                  '5.1': 'Khỏi bệnh sau khi mắc một trong các bệnh: thương hàn, nhiễm trùng máu, bị rắn cắn, viêm tắc động mạch, viêm tắc tĩnh mạch, viêm tủy, viêm tủy xương?',
                  '5.2': 'Sút cân nhanh không rõ nguyên nhân?',
                  '5.3': 'Nổi hạch kéo dài?',
                  '5.4': 'Thực hiện thủ thuật y tế xâm lấn (chữa răng, châm cứu, lăn kim, nội soi,…)?',
                  '5.5': 'Xăm, xỏ lỗ tai, lỗ mũi hoặc các vị trí khác trên cơ thể?',
                  '5.6': 'Sử dụng ma túy?',
                  '5.7': 'Tiếp xúc trực tiếp với máu, dịch tiết của người khác hoặc bị thương bởi kim tiêm?',
                  '5.8': 'Sinh sống chung với người nhiễm bệnh Viêm gan siêu vi B?',
                  '5.9': 'Quan hệ tình dục với người nhiễm viêm gan siêu vi B, C, HIV, giang mai hoặc người có nguy cơ nhiễm viêm gan siêu vi B, C, HIV, giang mai?',
                  '5.10': 'Quan hệ tình dục với người cùng giới?',
                  '5.11': 'Không',
                };
                return (
                  <>
                    {data.split(';').map((item, idx) => {
                      const trimmed = item.trim();
                      return (
                        <Typography key={idx} sx={{ mb: 0.5 }}>
                          {codeMap[trimmed] || trimmed}
                        </Typography>
                      );
                    })}
                  </>
                );
              }
              return <Typography>Không có thông tin</Typography>;
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenPatientCondition(false)}>Đóng</Button>
          </DialogActions>
        </Dialog>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
     </Container>
  );
};

export default DonationRequestManagement;
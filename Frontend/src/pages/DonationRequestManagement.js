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
} from '@mui/material';
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
  const [statusFilter, setStatusFilter] = useState('All');

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
        return <Chip label="Chờ duyệt" sx={{ backgroundColor: '#795548', color: 'white' }} />;
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

  // Sắp xếp các yêu cầu theo ID mới nhất lên đầu
  const sortedRequests = [...requests].sort((a, b) => (b.donationId || 0) - (a.donationId || 0));

  const filteredRequests = sortedRequests.filter(
    (req) => statusFilter === 'All' || req.status === statusFilter
  );

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
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: '#E53935' }}>
        Quản Lý Yêu Cầu Hiến Máu
      </Typography>

      {/* Tổng hợp trạng thái căn giữa, bỏ lọc theo trạng thái */}
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'All' ? '2px solid #9e9e9e' : '1px solid #e0e0e0', boxShadow: statusFilter === 'All' ? 4 : 1 }}
          onClick={() => setStatusFilter('All')}
          elevation={statusFilter === 'All' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Tất cả</Typography>
          <Typography variant="h4" fontWeight="bold">{requests.length}</Typography>
          <Chip label="Tất cả" sx={{ mt: 1, backgroundColor: '#9e9e9e', color: 'white' }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Approved' ? '2px solid #ed6c02' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Approved' ? 4 : 1 }}
          onClick={() => setStatusFilter('Approved')}
          elevation={statusFilter === 'Approved' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã duyệt</Typography>
          <Typography variant="h4" fontWeight="bold">{approvedCount}</Typography>
          <Chip label="Đã duyệt" color="warning" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: statusFilter === 'Completed' ? '2px solid #2e7d32' : '1px solid #e0e0e0', boxShadow: statusFilter === 'Completed' ? 4 : 1 }}
          onClick={() => setStatusFilter('Completed')}
          elevation={statusFilter === 'Completed' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Hoàn thành</Typography>
          <Typography variant="h4" fontWeight="bold">{completedCount}</Typography>
          <Chip label="Hoàn thành" color="success" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: (statusFilter === 'Rejected') ? '2px solid #d32f2f' : '1px solid #e0e0e0', boxShadow: (statusFilter === 'Rejected') ? 4 : 1 }}
          onClick={() => setStatusFilter('Rejected')}
          elevation={statusFilter === 'Rejected' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã từ chối</Typography>
          <Typography variant="h4" fontWeight="bold">{requests.filter(r => r.status === 'Rejected').length}</Typography>
          <Chip label="Đã từ chối" color="error" sx={{ mt: 1 }} />
        </Paper>
        <Paper
          sx={{ p: 2, minWidth: 150, textAlign: 'center', cursor: 'pointer', border: (statusFilter === 'Cancelled') ? '2px solid #795548' : '1px solid #e0e0e0', boxShadow: (statusFilter === 'Cancelled') ? 4 : 1 }}
          onClick={() => setStatusFilter('Cancelled')}
          elevation={statusFilter === 'Cancelled' ? 6 : 1}
        >
          <Typography variant="subtitle1" color="text.secondary">Đã hủy</Typography>
          <Typography variant="h4" fontWeight="bold">{requests.filter(r => r.status === 'Cancelled').length}</Typography>
          <Chip label="Đã hủy" sx={{ mt: 1, backgroundColor: '#795548', color: 'white' }} />
        </Paper>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Họ tên</TableCell>
                <TableCell>Số CCCD</TableCell>
                <TableCell>Nhóm máu</TableCell>
                <TableCell>Ngày hẹn</TableCell>
                <TableCell>Đợt hiến máu</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Ghi chú</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRequests.map((req) => (
                <TableRow key={req.donationId} hover>
                                  <TableCell>{req.donationId}</TableCell>
                <TableCell sx={{ minWidth: 180, maxWidth: 260 }}>{req.fullName || req.memberName}</TableCell>
                <TableCell>{req.citizenNumber}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {req.bloodTypeName}
                    {(req.bloodTypeId === 99 || req.bloodTypeName === 'Không biết') && (
                      <Chip 
                        label="⚠️ Cần cập nhật" 
                        color="warning" 
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </TableCell>
                  <TableCell>
                    {dayjs(req.preferredDonationDate).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>{`${req.periodId} - ${req.periodName}`}
                    <Box mt={1}>
                      <Typography variant="body2" color="primary" fontWeight="bold">Sức khỏe</Typography>
                      <Button variant="outlined" size="small" onClick={() => { setSelectedRequest(req); setOpenPatientCondition(true); }}>Chi tiết</Button>
                    </Box>
                  </TableCell>
                  <TableCell>{getStatusChip(req.status)}</TableCell>
                  <TableCell>{req.status === 'Cancelled' && req.notes ? <b>{req.notes}</b> : req.notes}</TableCell>
                  <TableCell>
                    {req.status === 'Pending' && (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleOpenDialog(req, 'Approve')}
                        >
                          Duyệt
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          onClick={() => handleOpenDialog(req, 'Reject')}
                        >
                          Từ chối
                        </Button>
                      </Box>
                    )}
                    {req.status === 'Approved' && (
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={() => handleOpenActionDialog(req, 'complete')}
                        >
                          Hoàn thành
                        </Button>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
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
          ⚠️ Cập nhật nhóm máu trước khi hoàn thành
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
                  <Box>
                    {data.split(';').map((item, idx) => {
                      const trimmed = item.trim();
                      return (
                        <Typography key={idx} sx={{ mb: 0.5 }}>
                          {codeMap[trimmed] || trimmed}
                        </Typography>
                      );
                    })}
                  </Box>
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
    </Box>
  );
};

export default DonationRequestManagement;
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
} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';

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

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
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

  const handleConfirmAction = async () => {
    if (!selectedRequest || !user) return;

    const newStatus = actionType === 'Approve' ? 'Approved' : 'Rejected';
    const responsibleById = user.userId;

    const payload = {
      Status: newStatus,
      Notes: notes,
      ResponsibleById: responsibleById,
      MemberId: selectedRequest.memberId, // Cần memberId để backend xác thực
    };

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/DonationRequest/${selectedRequest.donationId}/update-status`, payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Update the request in the local state
      setRequests(
        requests.map((req) =>
          req.donationId === selectedRequest.donationId
            ? { ...req, status: newStatus, notes: notes, responsibleById: responsibleById }
            : req
        )
      );

      handleCloseDialog();
      setSnackbar({ open: true, message: `Yêu cầu đã được ${newStatus === 'Approved' ? 'duyệt' : 'từ chối'}.`, severity: 'success' });
    } catch (error) {
      console.error('Error updating status:', error);
      setSnackbar({ open: true, message: 'Cập nhật trạng thái thất bại!', severity: 'error' });
    }
  };

  const handleOpenActionDialog = (request, mode) => {
    setActionRequest(request);
    setActionMode(mode);
    setOpenActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setActionRequest(null);
    setActionMode('');
  };

  const handleConfirmActionRequest = async () => {
    if (!actionRequest) return;
    const token = localStorage.getItem('token');
    console.log('Gọi hoàn thành:', actionRequest.donationId, actionRequest.memberId);
    if (!actionRequest.donationId || isNaN(actionRequest.donationId)) {
      setSnackbar({ open: true, message: 'ID yêu cầu không hợp lệ!', severity: 'error' });
      handleCloseActionDialog();
      return;
    }
    try {
      if (actionMode === 'complete') {
        await axios.patch(`/api/DonationRequest/update-completed/${actionRequest.donationId}`, {
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
        await axios.patch(`/api/DonationRequest/${actionRequest.donationId}/cancel`, {
          notes: 'Đã hủy bởi nhân viên',
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequests(
          requests.map((req) =>
            req.donationId === actionRequest.donationId
              ? { ...req, status: 'Cancelled', notes: 'Đã hủy bởi nhân viên' }
              : req
          )
        );
        setSnackbar({ open: true, message: 'Đã hủy yêu cầu!', severity: 'success' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Có lỗi xảy ra!', severity: 'error' });
    } finally {
      handleCloseActionDialog();
    }
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'Approved':
        return <Chip label="Đã duyệt" color="success" />;
      case 'Pending':
        return <Chip label="Chờ duyệt" color="warning" />;
      case 'Rejected':
      case 'Cancelled':
        return <Chip label="Đã từ chối" color="error" />;
      default:
        return <Chip label={status} />;
    }
  };

  const filteredRequests = requests.filter(
    (req) => statusFilter === 'All' || req.status === statusFilter
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Quản Lý Yêu Cầu Hiến Máu
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel>Lọc theo trạng thái</InputLabel>
        <Select
          value={statusFilter}
          label="Lọc theo trạng thái"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="All">Tất cả</MenuItem>
          <MenuItem value="Pending">Chờ duyệt</MenuItem>
          <MenuItem value="Approved">Đã duyệt</MenuItem>
          <MenuItem value="Rejected">Đã từ chối</MenuItem>
        </Select>
      </FormControl>

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
                  <TableCell>{req.memberName}</TableCell>
                  <TableCell>{req.citizenNumber}</TableCell>
                  <TableCell>{req.bloodTypeName}</TableCell>
                  <TableCell>
                    {dayjs(req.preferredDonationDate).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell>{`${req.periodId} - ${req.periodName}`}</TableCell>
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
                      <Box sx={{ display: 'flex', gap: 1 }}>
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
                          onClick={() => handleOpenActionDialog(req, 'cancel')}
                        >
                          Hủy
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
            này không? Vui lòng thêm ghi chú (nếu cần).
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Ghi chú"
            type="text"
            fullWidth
            variant="standard"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleConfirmAction} variant="contained">
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog xác nhận hoàn thành/hủy */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog}>
        <DialogTitle>
          {actionMode === 'complete' ? 'Xác nhận hoàn thành yêu cầu' : 'Xác nhận hủy yêu cầu'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn {actionMode === 'complete' ? 'đánh dấu hoàn thành' : 'hủy'} yêu cầu này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Hủy</Button>
          <Button onClick={handleConfirmActionRequest} variant="contained" color={actionMode === 'complete' ? 'success' : 'error'}>
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

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
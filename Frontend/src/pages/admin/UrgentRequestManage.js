import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

const UrgentRequestManage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách!', severity: 'error' });
    }
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAction = async (id, action) => {
    let url = `${API_URL}/UrgentBloodRequest/${id}`;
    let msg = '';
    if (action === 'accept') { url += '/accept'; msg = 'Đã tiếp nhận yêu cầu!'; }
    else if (action === 'fulfill') { url += '/fulfill'; msg = 'Đã hoàn thành yêu cầu!'; }
    else if (action === 'cancel') { url += '/cancel'; msg = 'Đã hủy yêu cầu!'; }
    try {
      await axios.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });
      setSnackbar({ open: true, message: msg, severity: 'success' });
      fetchRequests();
    } catch (err) {
      setSnackbar({ open: true, message: 'Thao tác thất bại!', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: '#E53935' }}>
        Quản Lý Yêu Cầu Máu Khẩn Cấp
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, mt: 3 }}>
        <Table>
          <TableHead style={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell><b>Tên bệnh nhân</b></TableCell>
              <TableCell><b>Nhóm máu</b></TableCell>
              <TableCell><b>Lý do</b></TableCell>
              <TableCell><b>Người liên hệ</b></TableCell>
              <TableCell><b>SĐT</b></TableCell>
              <TableCell><b>CCCD</b></TableCell>
              <TableCell><b>Ngày yêu cầu</b></TableCell>
              <TableCell><b>Trạng thái</b></TableCell>
              <TableCell align="center"><b>Hành động</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((r) => (
              <TableRow key={r.urgentRequestId}>
                <TableCell>{r.patientName}</TableCell>
                <TableCell>{r.bloodType?.bloodTypeName || '-'}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell>{r.contactName}</TableCell>
                <TableCell>{r.contactPhone}</TableCell>
                <TableCell>{r.citizenNumber || '-'}</TableCell>
                <TableCell>{new Date(r.requestDate).toLocaleString()}</TableCell>
                <TableCell>
                  {r.status === 'Pending' && (
                    <span style={{ color: '#e6a700', fontWeight: 600 }}>Chờ duyệt</span>
                  )}
                  {r.status === 'InProgress' && (
                    <span style={{ color: '#1976d2', fontWeight: 600 }}>Đang xử lý</span>
                  )}
                  {r.status === 'Fulfilled' && (
                    <span style={{ color: '#388e3c', fontWeight: 600 }}>Đã hoàn thành</span>
                  )}
                  {r.status === 'Cancelled' && (
                    <span style={{ color: '#d32f2f', fontWeight: 600 }}>Đã hủy</span>
                  )}
                </TableCell>
                <TableCell>
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <Button size="small" variant="outlined" onClick={() => { setSelected(r); setDetailOpen(true); }} sx={{ minWidth: 48, px: 1.5 }}>Xem</Button>
                    {r.status === 'Pending' && (
                      <Button size="small" color="primary" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'accept')} sx={{ minWidth: 90 }}>Tiếp nhận</Button>
                    )}
                    {r.status === 'InProgress' && (
                      <Button size="small" color="success" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'fulfill')} sx={{ minWidth: 90 }}>Hoàn tất</Button>
                    )}
                    {['Pending', 'InProgress'].includes(r.status) && (
                      <Button size="small" color="error" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'cancel')} sx={{ minWidth: 60 }}>Hủy</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={detailOpen} onClose={() => setDetailOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết yêu cầu máu khẩn</DialogTitle>
        <DialogContent>
          {selected && (
            <div style={{ display: 'grid', rowGap: 14, fontSize: 17, color: '#222' }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#e53935', marginBottom: 6 }}>Thông tin bệnh nhân</div>
              <div><b>Mã yêu cầu:</b> {selected.urgentRequestId}</div>
              <div><b>Tên bệnh nhân:</b> {selected.patientName}</div>
              <div><b>Nhóm máu:</b> {selected.bloodType?.bloodTypeName || '-'}</div>
              <div><b>Lý do cần máu:</b> {selected.reason}</div>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#e53935', margin: '10px 0 6px' }}>Người liên hệ</div>
              <div><b>Họ tên:</b> {selected.contactName}</div>
              <div><b>Số CCCD:</b> {selected.citizenNumber || '-'}</div>
              <div><b>Số điện thoại:</b> {selected.contactPhone}</div>
              <div><b>Email:</b> {selected.contactEmail}</div>
              <div><b>Địa chỉ:</b> {selected.emergencyLocation}</div>
              <div style={{ fontWeight: 600, fontSize: 18, color: '#e53935', margin: '10px 0 6px' }}>Khác</div>
              <div><b>Ghi chú:</b> {selected.notes || '-'}</div>
              <div><b>Ngày yêu cầu:</b> {new Date(selected.requestDate).toLocaleString()}</div>
              <div><b>Trạng thái:</b> {selected.status === 'Pending' ? 'Chờ duyệt' : selected.status === 'InProgress' ? 'Đang xử lý' : selected.status === 'Fulfilled' ? 'Đã hoàn thành' : selected.status === 'Cancelled' ? 'Đã hủy' : selected.status}</div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UrgentRequestManage; 
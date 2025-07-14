import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio
} from '@mui/material';
import axios from 'axios';

const UrgentRequestManage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [transfusionRequests, setTransfusionRequests] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [fulfillType, setFulfillType] = useState('');
  const [preemptedTransfusionId, setPreemptedTransfusionId] = useState('');
  const [usedBloodUnitId, setUsedBloodUnitId] = useState('');
  const [loadingTransfusions, setLoadingTransfusions] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    if (!token) {
      setSnackbar({ open: true, message: 'Token không hợp lệ. Vui lòng đăng nhập lại!', severity: 'error' });
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách yêu cầu máu khẩn:', err.response?.data || err.message);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách yêu cầu máu khẩn: ' + (err.response?.data?.error || err.message), severity: 'error' });
    }
  };

  const fetchTransfusionRequests = async () => {
    setLoadingTransfusions(true);
    try {
      const res = await axios.get(`${API_URL}/TransfusionRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const approvedRequests = res.data.filter(tr => tr.status === 'Approved');
      // Lọc thêm dựa trên BloodTypeId và ComponentId tương thích
      const compatibleRequests = approvedRequests.filter(tr =>
        tr.bloodTypeId === selected.requestedBloodTypeId &&
        (!selected.requestedComponentId || tr.componentId === selected.requestedComponentId)
      );
      setTransfusionRequests(compatibleRequests);
      if (compatibleRequests.length === 0) {
        setSnackbar({ open: true, message: 'Không tìm thấy yêu cầu truyền máu tương thích!', severity: 'warning' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải yêu cầu truyền máu!', severity: 'error' });
    } finally {
      setLoadingTransfusions(false);
    }
  };

  const fetchBloodUnits = async (requestId) => {
    if (!token) {
      setSnackbar({ open: true, message: 'Token không hợp lệ. Vui lòng đăng nhập lại!', severity: 'error' });
      return;
    }
    try {
      const request = requests.find(r => r.urgentRequestId === requestId);
      if (request) {
        const res = await axios.get(`${API_URL}/UrgentBloodRequest/search-blood-units`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            RequestedBloodTypeId: request.requestedBloodTypeId,
            RequestedComponentId: request.requestedComponentId,
            IncludeReserved: true,
          },
        });
        setBloodUnits(res.data);
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn vị máu:', err.response?.data || err.message);
      setSnackbar({ open: true, message: 'Lỗi khi tải đơn vị máu: ' + (err.response?.data?.error || err.message), severity: 'error' });
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTransfusionRequests();
  }, []);

  const handleAction = async (id, action) => {
    if (!token) {
      setSnackbar({ open: true, message: 'Token không hợp lệ. Vui lòng đăng nhập lại!', severity: 'error' });
      return;
    }
    let url = `${API_URL}/UrgentBloodRequest/${id}`;
    let msg = '';
    if (action === 'accept') {
      url += '/accept';
      msg = 'Đã tiếp nhận yêu cầu!';
      try {
        await axios.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        setSnackbar({ open: true, message: msg, severity: 'success' });
        fetchRequests();
      } catch (err) {
        setSnackbar({ open: true, message: 'Thao tác thất bại: ' + (err.response?.data?.error || err.message), severity: 'error' });
      }
    } else if (action === 'fulfill') {
      setSelected(requests.find(r => r.urgentRequestId === id));
      await fetchTransfusionRequests();
      await fetchBloodUnits(id);
      setFulfillOpen(true);
    } else if (action === 'cancel') {
      url += '/cancel';
      msg = 'Đã hủy yêu cầu!';
      try {
        await axios.patch(url, {}, { headers: { Authorization: `Bearer ${token}` } });
        setSnackbar({ open: true, message: msg, severity: 'success' });
        fetchRequests();
      } catch (err) {
        setSnackbar({ open: true, message: 'Thao tác thất bại: ' + (err.response?.data?.error || err.message), severity: 'error' });
      }
    }
  };

  const handleFulfillSubmit = async () => {
    if (!fulfillType) {
      setSnackbar({ open: true, message: 'Vui lòng chọn cách hoàn thành!', severity: 'error' });
      return;
    }
    if (fulfillType === 'transfusion' && !preemptedTransfusionId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn yêu cầu truyền máu!', severity: 'error' });
      return;
    }
    if (fulfillType === 'bloodUnit' && !usedBloodUnitId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn đơn vị máu!', severity: 'error' });
      return;
    }

    if (!token) {
      setSnackbar({ open: true, message: 'Token không hợp lệ. Vui lòng đăng nhập lại!', severity: 'error' });
      return;
    }

    try {
      const payload = {
        preemptedTransfusionRequestId: fulfillType === 'transfusion' ? parseInt(preemptedTransfusionId) : null,
        usedBloodUnitId: fulfillType === 'bloodUnit' ? parseInt(usedBloodUnitId) : null,
      };
      console.log('Payload gửi đi:', payload);
      console.log('URL API:', `${API_URL}/UrgentBloodRequest/${selected.urgentRequestId}/fulfill`);
      const response = await axios.patch(`${API_URL}/UrgentBloodRequest/${selected.urgentRequestId}/fulfill`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('API Response:', response.data);
      setSnackbar({ open: true, message: 'Đã hoàn thành yêu cầu!', severity: 'success' });
      setFulfillOpen(false);
      setFulfillType('');
      setPreemptedTransfusionId('');
      setUsedBloodUnitId('');
      fetchRequests();
    } catch (err) {
      console.error('Lỗi API:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      setSnackbar({ open: true, message: err.response?.data?.error || 'Thao tác thất bại! ' + err.message, severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>Quản lý yêu cầu máu khẩn cấp</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead style={{ background: '#f5f5f5' }}>
            <TableRow>
              <TableCell><b>Tên bệnh nhân</b></TableCell>
              <TableCell><b>Nhóm máu</b></TableCell>
              <TableCell><b>Lý do</b></TableCell>
              <TableCell><b>Người liên hệ</b></TableCell>
              <TableCell><b>SĐT</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Địa chỉ</b></TableCell>
              <TableCell><b>Ngày yêu cầu</b></TableCell>
              <TableCell><b>Trạng thái</b></TableCell>
              <TableCell><b>Thao tác</b></TableCell>
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
                <TableCell>{r.contactEmail}</TableCell>
                <TableCell>{r.emergencyLocation}</TableCell>
                <TableCell>{new Date(r.requestDate).toLocaleString()}</TableCell>
                <TableCell>{r.status}</TableCell>
                <TableCell>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                    <Button size="small" variant="outlined" onClick={() => { setSelected(r); setDetailOpen(true); }} sx={{ minWidth: 48, px: 1.5 }}>Xem</Button>
                    {r.status === 'Pending' && (
                      <Button size="small" color="primary" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'accept')} sx={{ minWidth: 90 }}>Tiếp nhận</Button>
                    )}
                    {r.status === 'InProgress' && (
                      <Button size="small" color="success" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'fulfill')} sx={{ minWidth: 90 }}>Hoàn thành</Button>
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
            <div style={{ display: 'grid', rowGap: 12 }}>
              <div><b>ID:</b> {selected.urgentRequestId}</div>
              <div><b>Tên bệnh nhân:</b> {selected.patientName}</div>
              <div><b>Nhóm máu:</b> {selected.bloodType?.bloodTypeName || '-'}</div>
              <div><b>Lý do:</b> {selected.reason}</div>
              <div><b>Người liên hệ:</b> {selected.contactName}</div>
              <div><b>SĐT:</b> {selected.contactPhone}</div>
              <div><b>Email:</b> {selected.contactEmail}</div>
              <div><b>Địa chỉ:</b> {selected.emergencyLocation}</div>
              <div><b>Ghi chú:</b> {selected.notes || 'Không có'}</div>
              <div><b>Ngày yêu cầu:</b> {new Date(selected.requestDate).toLocaleString()}</div>
              <div><b>Trạng thái:</b> {selected.status}</div>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={fulfillOpen} onClose={() => setFulfillOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu máu khẩn</DialogTitle>
        <DialogContent>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <Typography variant="subtitle1">Chọn cách hoàn thành</Typography>
            <RadioGroup value={fulfillType} onChange={(e) => setFulfillType(e.target.value)}>
              <FormControlLabel value="transfusion" control={<Radio />} label="Ưu tiên từ yêu cầu truyền máu" />
              <FormControlLabel value="bloodUnit" control={<Radio />} label="Sử dụng đơn vị máu trực tiếp" />
            </RadioGroup>
          </FormControl>
          {fulfillType === 'transfusion' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn yêu cầu truyền máu</InputLabel>
              <Select
                value={preemptedTransfusionId}
                onChange={(e) => setPreemptedTransfusionId(e.target.value)}
                disabled={loadingTransfusions}
              >
                {loadingTransfusions ? (
                  <MenuItem disabled>Đang tải...</MenuItem>
                ) : transfusionRequests.length > 0 ? (
                  transfusionRequests.map((tr) => (
                    <MenuItem key={tr.transfusionId} value={tr.transfusionId}>
                      ID: {tr.transfusionId} - {tr.patientCondition || 'Không có thông tin'} - {tr.bloodTypeName || 'Không xác định'}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có yêu cầu truyền máu nào khả dụng</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
          {fulfillType === 'bloodUnit' && (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Chọn đơn vị máu</InputLabel>
              <Select
                value={usedBloodUnitId}
                onChange={(e) => setUsedBloodUnitId(e.target.value)}
              >
                {bloodUnits.length > 0 ? (
                  bloodUnits.map((unit) => (
                    <MenuItem key={unit.bloodUnitId} value={unit.bloodUnitId}>
                      {unit.bloodTypeName} - {unit.componentName} - {unit.remainingVolume}ml
                      {unit.isReserved && ` (Đã đặt bởi ${unit.reservedForPatientName})`}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>Không có đơn vị máu nào khả dụng</MenuItem>
                )}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillOpen(false)}>Hủy</Button>
          <Button variant="contained" color="primary" onClick={handleFulfillSubmit}>
            Xác nhận
          </Button>
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
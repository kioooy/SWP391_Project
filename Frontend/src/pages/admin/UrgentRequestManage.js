import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Paper, Table, TableContainer, TableHead, TableBody, TableCell, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, CircularProgress
} from '@mui/material';
import axios from 'axios';


const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
const token = localStorage.getItem('token');


const EmergencyTransfusionPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transfusionRequests, setTransfusionRequests] = useState([]);
  const [bloodUnits, setBloodUnits] = useState([]);
  const [fulfillOpen, setFulfillOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [fulfillType, setFulfillType] = useState('');
  const [preemptedTransfusionId, setPreemptedTransfusionId] = useState('');
  const [usedBloodUnitId, setUsedBloodUnitId] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const fetchUrgentRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Lỗi khi lấy danh sách yêu cầu máu!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  const fetchTransfusionRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/TransfusionRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransfusionRequests(res.data.filter(tr => tr.status === 'Approved'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải yêu cầu truyền máu!', severity: 'error' });
    }
  };


  const fetchBloodUnits = async (requestId) => {
    try {
      const request = data.find(r => r.urgentRequestId === requestId);
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
      setSnackbar({ open: true, message: 'Lỗi khi tải đơn vị máu!', severity: 'error' });
    }
  };


  useEffect(() => {
    fetchUrgentRequests();
    fetchTransfusionRequests();
  }, []);


  const handleFulfill = (request) => {
    setSelectedRequest(request);
    fetchBloodUnits(request.urgentRequestId);
    setFulfillOpen(true);
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


    setSubmitting(true);
    try {
      const payload = {
        preemptedTransfusionRequestId: fulfillType === 'transfusion' ? parseInt(preemptedTransfusionId) : null,
        usedBloodUnitId: fulfillType === 'bloodUnit' ? parseInt(usedBloodUnitId) : null,
      };
      await axios.patch(`${API_URL}/UrgentBloodRequest/${selectedRequest.urgentRequestId}/fulfill`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: `Yêu cầu máu khẩn cấp cho ${selectedRequest.patientName} đã được hoàn thành!`, severity: 'success' });
      setFulfillOpen(false);
      setFulfillType('');
      setPreemptedTransfusionId('');
      setUsedBloodUnitId('');
      fetchUrgentRequests();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Thao tác thất bại! Vui lòng thử lại.', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = async (id) => {
    setSubmitting(true);
    try {
      await axios.patch(`${API_URL}/UrgentBloodRequest/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Yêu cầu đã được hủy thành công!', severity: 'success' });
      fetchUrgentRequests();
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Hủy yêu cầu thất bại!', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Container maxWidth="lg" style={{ padding: '32px 0' }}>
      <Typography variant="h4" gutterBottom>Quản Lý Yêu Cầu Máu Khẩn Cấp</Typography>
      <Paper elevation={3} style={{ padding: '16px' }}>
        {loading ? (
          <CircularProgress />
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Bệnh nhân</strong></TableCell>
                  <TableCell><strong>Nhóm máu</strong></TableCell>
                  <TableCell><strong>Ngày yêu cầu</strong></TableCell>
                  <TableCell><strong>Trạng thái</strong></TableCell>
                  <TableCell><strong>Thao tác</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.urgentRequestId}>
                    <TableCell>{item.patientName}</TableCell>
                    <TableCell>{item.bloodType?.bloodTypeName || 'Không xác định'}</TableCell>
                    <TableCell>
                      {new Date(item.requestDate).toLocaleString("vi-VN")}
                    </TableCell>
                    <TableCell>{item.status === 'Pending' ? 'Chờ xử lý' : item.status === 'InProgress' ? 'Đang xử lý' : item.status === 'Fulfilled' ? 'Đã hoàn thành' : 'Đã hủy'}</TableCell>
                    <TableCell>
                      {item.status === 'InProgress' && (
                        <Button variant="contained" color="success" onClick={() => handleFulfill(item)} disabled={submitting}>
                          Hoàn thành
                        </Button>
                      )}
                      {['Pending', 'InProgress'].includes(item.status) && (
                        <Button variant="contained" color="error" onClick={() => handleCancel(item.urgentRequestId)} sx={{ ml: 1 }} disabled={submitting}>
                          Hủy
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>


      <Dialog open={fulfillOpen} onClose={() => setFulfillOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu máu khẩn cấp cho {selectedRequest?.patientName}</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Vui lòng chọn cách hoàn thành yêu cầu máu khẩn cấp:
          </Typography>
          <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
            <RadioGroup value={fulfillType} onChange={(e) => setFulfillType(e.target.value)}>
              <FormControlLabel value="transfusion" control={<Radio />} label="Ưu tiên từ yêu cầu truyền máu" />
              <FormControlLabel value="bloodUnit" control={<Radio />} label="Sử dụng đơn vị máu trực tiếp" />
            </RadioGroup>
          </FormControl>
          {fulfillType === 'transfusion' && (
            <FormControl fullWidth sx={{ mt: 2 }} disabled={submitting}>
              <InputLabel>Chọn yêu cầu truyền máu</InputLabel>
              <Select
                value={preemptedTransfusionId}
                onChange={(e) => setPreemptedTransfusionId(e.target.value)}
              >
                {transfusionRequests.length === 0 && (
                  <MenuItem disabled>Không có yêu cầu truyền máu phù hợp</MenuItem>
                )}
                {transfusionRequests.map((tr) => (
                  <MenuItem key={tr.transfusionId} value={tr.transfusionId}>
                    {tr.patientCondition} - {tr.bloodType?.bloodTypeName} (ID: {tr.transfusionId})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {fulfillType === 'bloodUnit' && (
            <FormControl fullWidth sx={{ mt: 2 }} disabled={submitting}>
              <InputLabel>Chọn đơn vị máu</InputLabel>
              <Select
                value={usedBloodUnitId}
                onChange={(e) => setUsedBloodUnitId(e.target.value)}
              >
                {bloodUnits.length === 0 && (
                  <MenuItem disabled>Không có đơn vị máu phù hợp</MenuItem>
                )}
                {bloodUnits.map((unit) => (
                  <MenuItem key={unit.bloodUnitId} value={unit.bloodUnitId}>
                    {unit.bloodTypeName} - {unit.componentName} - {unit.remainingVolume}ml
                    {unit.isReserved && ` (Đã đặt bởi ${unit.reservedForPatientName})`}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillOpen(false)} disabled={submitting}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleFulfillSubmit}
            disabled={submitting}
          >
            {submitting ? <CircularProgress size={24} /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>


      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};


export default EmergencyTransfusionPage;
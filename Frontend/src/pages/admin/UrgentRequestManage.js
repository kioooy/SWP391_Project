import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, RadioGroup, FormControlLabel, Radio, CircularProgress
} from '@mui/material';
import axios from 'axios';


const UrgentRequestManage = () => {
  const [requests, setRequests] = useState([]);
  const [selected, setSelected] = useState(null); // Used for viewing details
  const [detailOpen, setDetailOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [fulfillOpen, setFulfillOpen] = useState(false); // For fulfill dialog
  const [selectedRequestToFulfill, setSelectedRequestToFulfill] = useState(null); // Request being fulfilled
  const [fulfillType, setFulfillType] = useState(''); // 'transfusion' or 'bloodUnit'
  const [preemptedTransfusionId, setPreemptedTransfusionId] = useState('');
  const [usedBloodUnitId, setUsedBloodUnitId] = useState('');
  const [transfusionRequests, setTransfusionRequests] = useState([]); // Approved transfusion requests
  const [bloodUnits, setBloodUnits] = useState([]); // Available blood units
  const [loading, setLoading] = useState(false); // For initial data load
  const [submitting, setSubmitting] = useState(false); // For action buttons
  const [selectBloodTypeOpen, setSelectBloodTypeOpen] = useState(false);
  const [selectedRequestToSetBloodType, setSelectedRequestToSetBloodType] = useState(null);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [chosenBloodTypeId, setChosenBloodTypeId] = useState('');


  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
  const token = localStorage.getItem('token');


  // Fetch all urgent requests
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách yêu cầu khẩn cấp!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };


  // Fetch approved transfusion requests for 'preempt' option
  const fetchTransfusionRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/TransfusionRequest`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter for 'Approved' status as per logic requirement
      setTransfusionRequests(res.data.filter(tr => tr.status === 'Approved'));
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải yêu cầu truyền máu!', severity: 'error' });
    }
  };


  // Fetch compatible blood units for 'direct use' option
  const fetchBloodUnits = async (requestId) => {
    try {
      const request = requests.find(r => r.urgentRequestId === requestId);
      if (request) {
        const res = await axios.get(`${API_URL}/UrgentBloodRequest/search-blood-units`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            RequestedBloodTypeId: request.requestedBloodTypeId,
            RequestedComponentId: request.requestedComponentId,
            IncludeReserved: true, // As per the provided logic
          },
        });
        setBloodUnits(res.data);
      }
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải đơn vị máu!', severity: 'error' });
    }
  };


  const fetchBloodTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/BloodType`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBloodTypes(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách nhóm máu!', severity: 'error' });
    }
  };


  useEffect(() => {
    fetchRequests();
    fetchTransfusionRequests(); // Fetch once on component mount
  }, []);


  // Handler for 'Accept', 'Fulfill', 'Cancel' actions
  const handleAction = async (id, action) => {
    let url = `${API_URL}/UrgentBloodRequest/${id}`;
    let msg = '';
    let successSeverity = 'success';
    let errorMsg = 'Thao tác thất bại!';
    const payload = {};


    setSubmitting(true);


    try {
      if (action === 'accept') {
        // Tìm request
        const req = requests.find(r => r.urgentRequestId === id);
        if (req && req.requestedBloodTypeId === 99) {
          setSelectedRequestToSetBloodType(req);
          fetchBloodTypes();
          setSelectBloodTypeOpen(true);
          setSubmitting(false);
          return; // Không gọi API accept ngay
        }
        url += '/accept';
        msg = 'Đã tiếp nhận yêu cầu!';
        await axios.patch(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else if (action === 'fulfill') {
        // This is now handled by a separate dialog, but keeping for clarity
        // if a simpler fulfill without options was ever needed.
        // For the current implementation, this part won't be directly called for 'fulfill' button.
        // The handleFulfillSubmit is responsible for actual API call for fulfill.
        return;
      } else if (action === 'cancel') {
        url += '/cancel';
        msg = 'Đã hủy yêu cầu!';
        await axios.patch(url, payload, { headers: { Authorization: `Bearer ${token}` } });
      }


      setSnackbar({ open: true, message: msg, severity: successSeverity });
      fetchRequests(); // Re-fetch data to update table
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || errorMsg, severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  // Opens the fulfill dialog and fetches relevant data
  const handleOpenFulfillDialog = (request) => {
    setSelectedRequestToFulfill(request);
    // Nếu nhóm máu là 99 (không biết), không fetch blood units, chỉ cảnh báo
    if (request.requestedBloodTypeId === 99) {
      setBloodUnits([]); // clear danh sách máu
    } else {
      fetchBloodUnits(request.urgentRequestId);
    }
    setFulfillOpen(true);
    setFulfillType(''); // Reset fulfill type on open
    setPreemptedTransfusionId('');
    setUsedBloodUnitId('');
  };


  // Handles submission of the fulfill dialog
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
    const payload = {
      preemptedTransfusionRequestId: fulfillType === 'transfusion' ? parseInt(preemptedTransfusionId) : null,
      usedBloodUnitId: fulfillType === 'bloodUnit' ? parseInt(usedBloodUnitId) : null,
    };


    try {
      await axios.patch(`${API_URL}/UrgentBloodRequest/${selectedRequestToFulfill.urgentRequestId}/fulfill`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: `Yêu cầu máu khẩn cấp cho ${selectedRequestToFulfill.patientName} đã được hoàn thành!`, severity: 'success' });
      setFulfillOpen(false);
      // Reset state for the next fulfill action
      setFulfillType('');
      setPreemptedTransfusionId('');
      setUsedBloodUnitId('');
      fetchRequests(); // Re-fetch data to update table
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Hoàn thành yêu cầu thất bại!', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: "bold", mb: 2, color: '#E53935' }}>
        Quản Lý Yêu Cầu Máu Khẩn Cấp
      </Typography>
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, mt: 3 }}>
        {loading ? (
          <CircularProgress sx={{ display: 'block', margin: '20px auto' }} />
        ) : (
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
                      <Button size="small" variant="outlined" onClick={() => { setSelected(r); setDetailOpen(true); }} sx={{ minWidth: 48, px: 1.5 }} disabled={submitting}>Xem</Button>
                      {r.status === 'Pending' && (
                        <Button size="small" color="primary" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'accept')} sx={{ minWidth: 90 }} disabled={submitting}>Tiếp nhận</Button>
                      )}
                      {r.status === 'InProgress' && (
                        <Button size="small" color="success" variant="contained" onClick={() => handleOpenFulfillDialog(r)} sx={{ minWidth: 90 }} disabled={submitting}>Hoàn tất</Button>
                      )}
                      {['Pending', 'InProgress'].includes(r.status) && (
                        <Button size="small" color="error" variant="contained" onClick={() => handleAction(r.urgentRequestId, 'cancel')} sx={{ minWidth: 60 }} disabled={submitting}>Hủy</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>


      {/* Detail Dialog */}
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


      {/* Fulfill Dialog */}
      <Dialog open={fulfillOpen} onClose={() => setFulfillOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu máu khẩn cấp cho {selectedRequestToFulfill?.patientName}</DialogTitle>
        <DialogContent>
          {selectedRequestToFulfill?.requestedBloodTypeId === 99 ? (
            <Alert severity="error" sx={{ mb: 2, fontSize: 16 }}>
              Không xác định được nhóm máu bệnh nhân.<br />
              <b>Vui lòng xác định nhóm máu trước khi chọn máu để truyền!</b>
            </Alert>
          ) : (
            <>
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
                <FormControl fullWidth sx={{ mt: 2, minWidth: 250, width: '100%' }} disabled={submitting}>
                  <InputLabel id="transfusion-request-label">Chọn yêu cầu truyền máu</InputLabel>
                  <Select
                    labelId="transfusion-request-label"
                    label="Chọn yêu cầu truyền máu"
                    value={preemptedTransfusionId}
                    onChange={(e) => setPreemptedTransfusionId(e.target.value)}
                    fullWidth
                    sx={{ width: '100%' }}
                  >
                    {transfusionRequests.length === 0 && (
                      <MenuItem disabled sx={{ minWidth: 0 }}>Không có yêu cầu truyền máu phù hợp</MenuItem>
                    )}
                    {transfusionRequests.map((tr) => (
                      <MenuItem key={tr.transfusionId} value={tr.transfusionId} sx={{ minWidth: 0 }}>
                        {tr.patientCondition} - {tr.bloodType?.bloodTypeName} (ID: {tr.transfusionId})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
              {fulfillType === 'bloodUnit' && (
                <FormControl fullWidth sx={{ mt: 2, minWidth: 250, width: '100%' }} disabled={submitting}>
                  <InputLabel id="blood-unit-label">Chọn đơn vị máu</InputLabel>
                  <Select
                    labelId="blood-unit-label"
                    label="Chọn đơn vị máu"
                    value={usedBloodUnitId}
                    onChange={(e) => setUsedBloodUnitId(e.target.value)}
                    fullWidth
                    sx={{ width: '100%' }}
                  >
                    {bloodUnits.length === 0 && (
                      <MenuItem disabled sx={{ minWidth: 0 }}>Không có đơn vị máu phù hợp</MenuItem>
                    )}
                    {bloodUnits.map((unit) => (
                      <MenuItem key={unit.bloodUnitId} value={unit.bloodUnitId} sx={{ minWidth: 0 }}>
                        {unit.bloodTypeName} - {unit.componentName} - {unit.remainingVolume}ml
                        {unit.isReserved && ` (Đã đặt bởi ${unit.reservedForPatientName})`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillOpen(false)} disabled={submitting}>Hủy</Button>
          {/* Ẩn nút xác nhận nếu chưa biết nhóm máu */}
          {selectedRequestToFulfill?.requestedBloodTypeId !== 99 && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleFulfillSubmit}
              disabled={submitting || (!preemptedTransfusionId && !usedBloodUnitId)}
            >
              {submitting ? <CircularProgress size={24} /> : 'Xác nhận'}
            </Button>
          )}
        </DialogActions>
      </Dialog>


      {/* Dialog chọn nhóm máu khi tiếp nhận yêu cầu bloodtype = 99 */}
      <Dialog open={selectBloodTypeOpen} onClose={() => setSelectBloodTypeOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn nhóm máu cho bệnh nhân</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel id="blood-type-label">Nhóm máu</InputLabel>
            <Select
              labelId="blood-type-label"
              label="Nhóm máu"
              value={chosenBloodTypeId}
              onChange={(e) => setChosenBloodTypeId(e.target.value)}
              fullWidth
            >
              {bloodTypes.map(bt => (
                <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>{bt.bloodTypeName}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectBloodTypeOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!chosenBloodTypeId || submitting}
            onClick={async () => {
              if (!selectedRequestToSetBloodType) return;
              try {
                // Gọi API cập nhật bloodtype cho yêu cầu
                await axios.patch(`${API_URL}/UrgentBloodRequest/${selectedRequestToSetBloodType.urgentRequestId}/set-blood-type`,
                  { bloodTypeId: chosenBloodTypeId },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                // Sau khi cập nhật, tự động tiếp nhận
                await axios.patch(`${API_URL}/UrgentBloodRequest/${selectedRequestToSetBloodType.urgentRequestId}/accept`, {}, { headers: { Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: 'Đã cập nhật nhóm máu và tiếp nhận yêu cầu!', severity: 'success' });
                setSelectBloodTypeOpen(false);
                setChosenBloodTypeId('');
                setSelectedRequestToSetBloodType(null);
                fetchRequests();
              } catch (err) {
                setSnackbar({ open: true, message: 'Cập nhật nhóm máu hoặc tiếp nhận thất bại!', severity: 'error' });
              }
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>


      {/* Snackbar for alerts */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};


export default UrgentRequestManage;
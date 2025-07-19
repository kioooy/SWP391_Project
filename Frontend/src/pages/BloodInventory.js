import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const BloodInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isStaff = user?.role?.toLowerCase() === 'staff';
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    componentId: '',
    volume: '',
    bloodStatus: 'Available',
    addDate: null,
    remainingVolume: '',
  });
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [bloodToDelete, setBloodToDelete] = useState(null);

  // Hardcode tạm danh sách nhóm máu, thành phần máu, member
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' }, { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' }, { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
  ];
  const components = [
    { id: 1, name: 'Máu toàn phần' },
    { id: 2, name: 'Hồng cầu' },
    { id: 3, name: 'Huyết tương' },
    { id: 4, name: 'Tiểu cầu' }
  ];
  const members = [
    { id: 1, name: 'Nguyen Van A' },
    { id: 2, name: 'Le Thi B' },
    { id: 3, name: 'Tran Van C' }
  ];

  // Đối tượng ánh xạ dịch thuật cho thành phần máu
  const bloodComponentTranslations = {
    "Whole Blood": "Máu toàn phần",
    "Red Blood Cells": "Hồng cầu",
    "Plasma": "Huyết tương",
    "Platelets": "Tiểu cầu",
    "Máu toàn phần": "Máu toàn phần",
    "Hồng cầu": "Hồng cầu",
    "Huyết tương": "Huyết tương",
    "Tiểu cầu": "Tiểu cầu"
  };

  // Fetch inventory
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/BloodUnit', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInventory(res.data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Không thể tải dữ liệu kho máu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleOpenDialog = (blood = null) => {
    if (blood) {
      setSelectedBlood(blood);
      setFormData({
        bloodTypeId: blood.bloodTypeId || '',
        componentId: blood.componentId || '',
        volume: blood.volume || '',
        bloodStatus: blood.bloodStatus || 'Available',
        addDate: blood.addDate ? dayjs(blood.addDate) : null,
        remainingVolume: blood.remainingVolume || '',
      });
      setError('');
    } else {
      setSelectedBlood(null);
      setFormData({
        bloodTypeId: '',
        componentId: '',
        volume: '',
        bloodStatus: 'Available',
        addDate: dayjs(),
        remainingVolume: '',
      });
      setError('');
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBlood(null);
    setError('');
  };

  // Thêm hoặc cập nhật đơn vị máu
  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const isUpdating = !!selectedBlood;
    // Kiểm tra thể tích còn lại không vượt quá thể tích gốc khi cập nhật
    if (isUpdating) {
      const maxVolume = selectedBlood.volume;
      if (parseInt(formData.remainingVolume, 10) > maxVolume) {
        setError(`Thể tích còn lại không được vượt quá thể tích gốc (${maxVolume} ml)!`);
        return;
      }
    }
    try {
      if (isUpdating) {
        const payload = {
          bloodTypeId: formData.bloodTypeId,
          componentId: formData.componentId,
          volume: parseInt(formData.volume, 10),
          bloodStatus: formData.bloodStatus,
          remainingVolume: parseInt(formData.remainingVolume, 10),
          addDate: formData.addDate ? formData.addDate.format('YYYY-MM-DD') : null,
        };
        await axios.patch(`/api/BloodUnit/${selectedBlood.bloodUnitId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Thêm mới: luôn là nhập kho, không có memberId, trạng thái luôn là Available
        const payload = {
          bloodTypeId: formData.bloodTypeId,
          componentId: formData.componentId,
          volume: parseInt(formData.volume, 10),
          bloodStatus: 'Available',
        };
        await axios.post('/api/BloodUnit', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchInventory();
      handleCloseDialog();
    } catch (err) {
      setError(`Lưu dữ liệu thất bại! Lỗi: ${err.response?.data?.title || err.response?.data?.errors?.Volume || err.message}`);
    }
  };

  // Xóa (soft delete)
  const handleDelete = async (blood) => {
    const token = localStorage.getItem('token');
    try {
      // Gọi API chuyển trạng thái sang Discarded
      await axios.patch(`/api/BloodUnit/${blood.bloodUnitId}/status-discard`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
      setError('');
      // Có thể thêm thông báo thành công ở đây nếu muốn
    } catch (err) {
      setError(`Xóa thất bại! Lỗi: ${err.response?.data?.title || err.message}`);
    }
  };

  // Thống kê tổng số lượng máu theo nhóm
  const totalByType = bloodTypes.reduce((acc, type) => {
    const total = inventory.filter((item) => item.bloodTypeName === type.name && item.bloodStatus === 'Available')
      .reduce((sum, item) => sum + (item.remainingVolume || 0), 0);
    acc[type.name] = total;
    return acc;
  }, {});

  const getStatusChip = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return <Chip icon={<CheckCircleIcon />} label="Có sẵn" color="success" size="small" />;
      case 'reserved':
        return <Chip icon={<WarningIcon />} label="Đã đặt" color="warning" size="small" />;
      case 'expired':
        return <Chip icon={<WarningIcon />} label="Hết hạn" color="error" size="small" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Quản lý kho máu
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading ? <Box textAlign="center"><LinearProgress /></Box> : <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {bloodTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type.id}>
            <Card>
              <CardContent>
                 <Typography variant="h6" gutterBottom>
                   Nhóm máu {type.name}
                 </Typography>
                 <Typography variant="h4" color="primary" gutterBottom>
                   {totalByType[type.name] || 0}
                 </Typography>
                 <Typography variant="body2" color="text.secondary">
                   Thể tích (ml)
                 </Typography>
                 <LinearProgress
                   variant="determinate"
                   value={(totalByType[type.name] || 0) * 10}
                   sx={{ mt: 1 }}
                 />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
       {/* Bảng quản lý kho máu */}
       <Card>
         <CardContent>
           <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
             <Typography variant="h6">Danh sách đơn vị máu</Typography>
            {(isAdmin || isStaff) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
              >
                Tiếp nhận đơn vị máu
              </Button>
            )}
           </Box>
        <TableContainer component={Paper}>
             <Table>
            <TableHead>
              <TableRow>
                   <TableCell>ID</TableCell>
                   <TableCell>Nhóm máu</TableCell>
                   <TableCell>Thành phần</TableCell>
                   <TableCell>Người hiến</TableCell>
                   <TableCell>Ngày nhập</TableCell>
                   <TableCell>Ngày hết hạn</TableCell>
                   <TableCell>Thể tích (ml)</TableCell>
                   <TableCell>Còn lại (ml)</TableCell>
                   <TableCell>Trạng thái</TableCell>
                   {isAdmin && <TableCell>Thao tác</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
                 {inventory.filter(row => (row.remainingVolume ?? row.remaining_volume ?? row.RemainingVolume) > 0).map((row) => (
                   <TableRow key={row.bloodUnitId}>
                     <TableCell>{row.bloodUnitId}</TableCell>
                     <TableCell>{row.bloodTypeName}</TableCell>
                     <TableCell>{bloodComponentTranslations[row.componentName] || row.componentName}</TableCell>
                     <TableCell>{row.fullName || ''}</TableCell>
                     <TableCell>{row.addDate ? new Date(row.addDate).toLocaleDateString() : ''}</TableCell>
                     <TableCell>{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : ''}</TableCell>
                     <TableCell>{row.volume}</TableCell>
                     <TableCell>{row.remainingVolume}</TableCell>
                     <TableCell>{getStatusChip(row.bloodStatus)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        <Tooltip title="Chỉnh sửa đơn vị máu">
                          <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa đơn vị máu">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => { setBloodToDelete(row); setOpenConfirmDialog(true); }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                 ))}
            </TableBody>
          </Table>
        </TableContainer>
         </CardContent>
       </Card>
        </>}
       {/* Dialog thêm/sửa đơn vị máu */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBlood ? 'Cập nhật đơn vị máu' : 'Thêm đơn vị máu mới'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {/* Khi chỉnh sửa chỉ cho phép sửa thể tích còn lại và trạng thái */}
            {!selectedBlood && (
              <>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="blood-type-label">Nhóm máu</InputLabel>
                  <Select
                    labelId="blood-type-label"
                    name="bloodTypeId"
                    value={formData.bloodTypeId}
                    onChange={(e) => setFormData({...formData, bloodTypeId: e.target.value})}
                    label="Nhóm máu"
                  >
                    {bloodTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="blood-component-label">Thành phần máu</InputLabel>
                  <Select
                    labelId="blood-component-label"
                    name="componentId"
                    value={formData.componentId}
                    onChange={(e) => setFormData({...formData, componentId: e.target.value})}
                    label="Thành phần máu"
                  >
                    {components.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
                <TextField
                  label="Thể tích (ml)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.volume}
                  onChange={(e) => setFormData({...formData, volume: e.target.value})}
                />
                <DatePicker
                  label="Ngày nhập kho"
                  value={formData.addDate}
                  onChange={(newValue) => setFormData({ ...formData, addDate: newValue })}
                  renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                />
              </>
            )}
            {selectedBlood && (
              <>
                <TextField
                  label="Thể tích còn lại (ml)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.remainingVolume}
                  onChange={(e) => {
                    const value = e.target.value;
                    let errorMsg = '';
                    if (selectedBlood && parseInt(value, 10) > selectedBlood.volume) {
                      errorMsg = `Thể tích còn lại không được vượt quá thể tích gốc (${selectedBlood.volume} ml)!`;
                    }
                    setError(errorMsg);
                    setFormData({...formData, remainingVolume: value});
                  }}
                  error={!!error && error.includes('Thể tích còn lại')}
                  helperText={error && error.includes('Thể tích còn lại') ? error : ''}
                />
                <TextField
                  label="Trạng thái"
                  select
                  fullWidth
                  margin="normal"
                  value={formData.bloodStatus}
                  onChange={(e) => setFormData({...formData, bloodStatus: e.target.value})}
                >
                  <MenuItem value="Available">Có sẵn</MenuItem>
                  <MenuItem value="Reserved">Đã đặt</MenuItem>
                  <MenuItem value="Expired">Hết hạn</MenuItem>
                </TextField>
              </>
            )}
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBlood ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Dialog xác nhận xóa đơn vị máu */}
      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Xác nhận xóa đơn vị máu</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa đơn vị máu này không?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (bloodToDelete) await handleDelete(bloodToDelete);
              setOpenConfirmDialog(false);
              setBloodToDelete(null);
            }}
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BloodInventory; 
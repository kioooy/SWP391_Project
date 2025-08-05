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
  LocalHospital as LocalHospitalIcon,
  History as HistoryIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Visibility as VisibilityIcon } from '@mui/icons-material';


const BloodInventory = () => {
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isStaff = user?.role?.toLowerCase() === 'staff';
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [viewDetail, setViewDetail] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bloodToDelete, setBloodToDelete] = useState(null);
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    componentId: '',
    volume: '',
    bloodStatus: 'Available',
    addDate: null,
    remainingVolume: '',
    note: '',
  });


  // State cho lịch sử đơn vị máu
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [selectedBloodHistory, setSelectedBloodHistory] = useState(null);
  const [bloodHistory, setBloodHistory] = useState({
    donationHistory: [],
    transfusionHistory: [],
    urgentHistory: [],
    allHistory: []
  });
  const [loadingHistory, setLoadingHistory] = useState(false);


  // State cho tìm kiếm và bộ lọc
  const [searchBloodUnitId, setSearchBloodUnitId] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterComponent, setFilterComponent] = useState('');
  const [filterVolumeMin, setFilterVolumeMin] = useState('');
  const [filterVolumeMax, setFilterVolumeMax] = useState('');


  // Hardcode tạm danh sách nhóm máu, thành phần máu, trạng thái
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' }, { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' }, { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
  ];
  const components = [
    { id: 1, name: 'Whole Blood', description: 'Máu toàn phần' },
    { id: 2, name: 'Red Blood Cells', description: 'Hồng cầu' },
    { id: 3, name: 'Plasma', description: 'Huyết tương' },
    { id: 4, name: 'Platelets', description: 'Tiểu cầu' }
  ];
  const statuses = [
    { value: '', label: 'Tất cả' },
    { value: 'available', label: 'Có sẵn' },
    { value: 'reserved', label: 'Đã đặt' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'used', label: 'Đã sử dụng' },
    { value: 'discarded', label: 'Đã loại bỏ' },
  ];


  const members = [
    { id: 1, name: 'Nguyen Van A' },
    { id: 2, name: 'Le Thi B' },
    { id: 3, name: 'Tran Van C' }
  ];


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
    const initializePage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        await axios.patch('/api/BloodUnit/expire-check', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        await fetchInventory();
      } catch (err) {
        console.error("Lỗi khi khởi tạo trang:", err.response?.data || err.message);
        setError(`Khởi tạo trang thất bại! Lỗi: ${err.response?.data?.title || err.message}`);
      } finally {
        setLoading(false);
      }
    };
    initializePage();
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
        note: blood.note || '',
      });
    } else {
      setSelectedBlood(null);
      setFormData({
        bloodTypeId: '',
        componentId: '',
        volume: '',
        bloodStatus: 'Available',
        addDate: dayjs(),
        remainingVolume: '',
        note: '',
      });
    }
    setOpenDialog(true);
  };


  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBlood(null);
  };


  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const isUpdating = !!selectedBlood;
    try {
      if (isUpdating) {
        const payload = {
          bloodTypeId: formData.bloodTypeId,
          componentId: formData.componentId,
          volume: parseInt(formData.volume, 10),
          bloodStatus: formData.bloodStatus,
          note: formData.note,
          remainingVolume: parseInt(formData.remainingVolume, 10),
          addDate: formData.addDate ? formData.addDate.format('YYYY-MM-DD') : null,
        };
        await axios.patch(`/api/BloodUnit/${selectedBlood.bloodUnitId}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        const payload = {
          bloodTypeId: formData.bloodTypeId,
          componentId: formData.componentId,
          volume: parseInt(formData.volume, 10),
          bloodStatus: 'Available',
          addDate: dayjs().format('YYYY-MM-DD'),
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


  const handleExpireCheck = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      await axios.patch('/api/BloodUnit/expire-check', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchInventory();
      setError('');
    } catch (err) {
      console.error("Lỗi khi kiểm tra hết hạn:", err.response?.data || err.message);
      setError(`Kiểm tra hết hạn thất bại! Lỗi: ${err.response?.data?.title || err.message}`);
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteClick = (blood) => {
    setBloodToDelete(blood);
    setDeleteDialogOpen(true);
  };


  const handleDelete = async () => {
    if (!bloodToDelete) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(`/api/BloodUnit/${bloodToDelete.bloodUnitId}/status-discard`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeleteDialogOpen(false);
      setBloodToDelete(null);
      fetchInventory();
    } catch (error) {
      console.error('Lỗi khi xóa đơn vị máu:', error);
      setError('Không thể xóa đơn vị máu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  const handleViewHistory = async (bloodUnit) => {
    try {
      setLoadingHistory(true);
      setSelectedBloodHistory(bloodUnit);
      setHistoryDialogOpen(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(`/api/BloodUnit/${bloodUnit.bloodUnitId}/history`, { headers });
      let donationHistory = [];
      let transfusionHistory = [];
      let urgentHistory = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          response.data.forEach(item => {
            if (item.donationId) {
              donationHistory.push({ ...item, requestType: 'DonationRequest' });
            } else if (item.transfusionId) {
              transfusionHistory.push({ ...item, requestType: 'TransfusionRequest' });
            } else if (item.urgentRequestId) {
              urgentHistory.push({ ...item, requestType: 'UrgentBloodRequest' });
            }
          });
        } else if (typeof response.data === 'object') {
          if (response.data.donationRequest && Array.isArray(response.data.donationRequest)) {
            donationHistory = response.data.donationRequest
              .filter(item => item.donationId && item.donationVolume > 0)
              .map(item => ({ ...item, requestType: 'DonationRequest' }));
          }
          if (response.data.transfusionRequest && Array.isArray(response.data.transfusionRequest)) {
            transfusionHistory = response.data.transfusionRequest
              .filter(item => item.transfusionId && item.assignedVolume > 0)
              .map(item => ({ ...item, requestType: 'TransfusionRequest' }));
          }
          if (response.data.urgentBloodRequest && Array.isArray(response.data.urgentBloodRequest)) {
            urgentHistory = response.data.urgentBloodRequest
              .filter(item => item.urgentRequestId && item.assignedVolume > 0)
              .map(item => ({ ...item, requestType: 'UrgentBloodRequest' }));
          }
        }
      }
      const allHistory = [...donationHistory, ...transfusionHistory, ...urgentHistory];
      setBloodHistory({ donationHistory, transfusionHistory, urgentHistory, allHistory });
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đơn vị máu:', error);
      if (error.response?.status === 401) {
        setError('Bạn cần đăng nhập để xem lịch sử đơn vị máu.');
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy lịch sử cho đơn vị máu này.');
      } else if (error.response?.status === 500) {
        setError('Lỗi server khi lấy lịch sử. Vui lòng thử lại sau.');
      } else {
        setError(`Không thể kết nối để lấy lịch sử. Lỗi: ${error.message}`);
      }
      setBloodHistory({ donationHistory: [], transfusionHistory: [], urgentHistory: [], allHistory: [] });
    } finally {
      setLoadingHistory(false);
    }
  };


  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedBloodHistory(null);
    setBloodHistory({ donationHistory: [], transfusionHistory: [], urgentHistory: [], allHistory: [] });
  };


  const getUpdatedStatus = (status, remainingVolume) => {
    if (remainingVolume === 0) return 'used';
    return status || 'available';
  };


  const totalByType = bloodTypes.reduce((acc, type) => {
    const total = inventory.filter((item) => item.bloodTypeName === type.name && item.bloodStatus === 'Available')
      .reduce((sum, item) => sum + (item.remainingVolume || 0), 0);
    acc[type.name] = total;
    return acc;
  }, {});


  const getStatusChip = (status, remainingVolume) => {
    if (remainingVolume === 0) {
      return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng" sx={{ backgroundColor: '#9e9e9e', color: 'white' }} size="small" />;
    }
    switch (status?.toLowerCase()) {
      case 'available':
        if (remainingVolume > 0 && remainingVolume < 100) {
          return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng một phần" color="warning" size="small" />;
        }
        return <Chip icon={<CheckCircleIcon />} label="Có sẵn" color="success" size="small" />;
      case 'reserved':
        return <Chip icon={<WarningIcon />} label="Đã đặt" color="secondary" size="small" />;
      case 'expired':
        return <Chip icon={<WarningIcon />} label="Hết hạn" color="error" size="small" />;
      case 'used':
        return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng" sx={{ backgroundColor: '#9e9e9e', color: 'white' }} size="small" />;
      case 'discarded':
        return <Chip icon={<WarningIcon />} label="Đã loại bỏ" color="error" size="small" />;
      default:
        if (remainingVolume > 0 && remainingVolume < 100) {
          return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng một phần" color="warning" size="small" />;
        }
        return <Chip icon={<CheckCircleIcon />} label="Có sẵn" color="success" size="small" />;
    }
  };


  const getStatusText = (status, remainingVolume) => {
    if (remainingVolume === 0) return 'Đã sử dụng';
    switch (status?.toLowerCase()) {
      case 'available':
        if (remainingVolume > 0 && remainingVolume < 100) return 'Đã sử dụng một phần';
        return 'Có sẵn';
      case 'reserved':
        return 'Đã đặt';
      case 'expired':
        return 'Hết hạn';
      case 'used':
        return 'Đã sử dụng';
      case 'discarded':
        return 'Đã loại bỏ';
      default:
        if (remainingVolume > 0 && remainingVolume < 100) return 'Đã sử dụng một phần';
        return 'Có sẵn';
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
                    đơn vị máu có sẵn
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
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h6">Danh sách đơn vị máu</Typography>
                <TextField
                  label="Tìm kiếm nhóm máu"
                  variant="outlined"
                  size="small"
                  value={searchBloodUnitId}
                  onChange={(e) => setSearchBloodUnitId(e.target.value)}
                  placeholder="Nhập ID hoặc tên nhóm máu"
                  sx={{ minWidth: 200 }}
                />
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                  >
                    {statuses.map((status) => (
                      <MenuItem key={status.value} value={status.value}>{status.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Thành phần</InputLabel>
                  <Select
                    value={filterComponent}
                    onChange={(e) => setFilterComponent(e.target.value)}
                    label="Thành phần"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {components.map((component) => (
                      <MenuItem key={component.id} value={component.name}>{component.description}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Thể tích min (ml)"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={filterVolumeMin}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterVolumeMin(value ? parseInt(value, 10).toString() : '');
                  }}
                  sx={{ width: 150 }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Thể tích max (ml)"
                  type="number"
                  variant="outlined"
                  size="small"
                  value={filterVolumeMax}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFilterVolumeMax(value ? parseInt(value, 10).toString() : '');
                  }}
                  sx={{ width: 150 }}
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Box>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Nhóm máu</TableCell>
                    <TableCell>Thành phần</TableCell>
                    <TableCell>Ngày nhập</TableCell>
                    <TableCell>Ngày hết hạn</TableCell>
                    <TableCell>Thể tích (ml)</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    {isAdmin && <TableCell>Thao tác</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory
                    .filter(row => {
                      const matchesSearch = !searchBloodUnitId ||
                        row.bloodUnitId.toString().includes(searchBloodUnitId) ||
                        row.bloodTypeName.toLowerCase().includes(searchBloodUnitId.toLowerCase());
                      const matchesStatus = !filterStatus ||
                        getUpdatedStatus(row.bloodStatus, row.remainingVolume).toLowerCase() === filterStatus.toLowerCase();
                      const matchesComponent = !filterComponent ||
                        row.componentName === filterComponent;
                      const matchesVolumeMin = !filterVolumeMin ||
                        row.remainingVolume >= parseInt(filterVolumeMin, 10);
                      const matchesVolumeMax = !filterVolumeMax ||
                        row.remainingVolume <= parseInt(filterVolumeMax, 10);
                      return matchesSearch && matchesStatus && matchesComponent && matchesVolumeMin && matchesVolumeMax;
                    })
                    .sort((a, b) => b.bloodUnitId - a.bloodUnitId)
                    .map((row) => (
                      <TableRow
                        key={row.bloodUnitId}
                        style={row.remainingVolume === 0 ? { opacity: 0.5, background: '#f5f5f5' } : {}}
                      >
                        <TableCell>{row.bloodUnitId}</TableCell>
                        <TableCell>{row.bloodTypeName}</TableCell>
                        <TableCell>{components.find(c => c.name === row.componentName)?.description}</TableCell>
                        <TableCell>{row.addDate ? new Date(row.addDate).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{row.expiryDate ? new Date(row.expiryDate).toLocaleDateString() : ''}</TableCell>
                        <TableCell>{row.remainingVolume}</TableCell>
                        <TableCell>{getStatusChip(getUpdatedStatus(row.bloodStatus, row.remainingVolume), row.remainingVolume)}</TableCell>
                        {isAdmin && (
                          <TableCell>
                            <Tooltip title="Xem lịch sử">
                              <IconButton size="small" color="info" onClick={() => handleViewHistory(row)}>
                                <HistoryIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xem chi tiết">
                              <IconButton size="small" onClick={() => setViewDetail(row)}>
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Chỉnh sửa đơn vị máu">
                              <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa đơn vị máu">
                              <IconButton size="small" color="error" onClick={() => handleDeleteClick(row)}>
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
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedBlood ? 'Cập nhật đơn vị máu' : 'Thêm đơn vị máu mới'}</DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {!selectedBlood && (
              <>
                <TextField
                  select
                  label="Nhóm máu"
                  fullWidth
                  margin="normal"
                  value={formData.bloodTypeId}
                  onChange={(e) => setFormData({ ...formData, bloodTypeId: e.target.value })}
                >
                  {bloodTypes.map(t => <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>)}
                </TextField>
                <TextField
                  select
                  label="Thành phần máu"
                  fullWidth
                  margin="normal"
                  value={formData.componentId}
                  onChange={(e) => setFormData({ ...formData, componentId: e.target.value })}
                >
                  {components.map(c => <MenuItem key={c.id} value={c.id}>{c.description}</MenuItem>)}
                </TextField>
                <TextField
                  label="Thể tích (ml)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.volume}
                  onChange={(e) => {
                    const value = parseInt(e.target.value, 10);
                    const validValue = isNaN(value) || value < 0 ? 0 : value;
                    setFormData({ ...formData, volume: validValue.toString() });
                  }}
                  inputProps={{ min: 0 }}
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
                    const value = parseInt(e.target.value, 10);
                    const validValue = isNaN(value) || value < 0 ? 0 : value;
                    setFormData({ ...formData, remainingVolume: validValue.toString() });
                  }}
                  inputProps={{ min: 0 }}
                />
                <TextField
                  label="Trạng thái"
                  select
                  fullWidth
                  margin="normal"
                  value={formData.bloodStatus}
                  onChange={(e) => setFormData({ ...formData, bloodStatus: e.target.value })}
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
      <Dialog open={!!viewDetail} onClose={() => setViewDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết đơn vị máu</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Nhóm máu:</strong> {viewDetail?.bloodTypeName || 'Không có'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Thành phần: </strong>
                {viewDetail
                  ? components.find(c => c.name === viewDetail.componentName)?.description || 'Không có'
                  : 'Không có'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Dung tích:</strong> {viewDetail?.volume} ml</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Dung tích còn lại:</strong> {viewDetail?.remainingVolume} ml</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Ngày nhập:</strong> {viewDetail?.addDate || 'Không có'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Hạn sử dụng:</strong> {viewDetail?.expiryDate || 'Không có'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography><strong>Trạng thái:</strong> {getStatusText(getUpdatedStatus(viewDetail?.bloodStatus, viewDetail?.remainingVolume), viewDetail?.remainingVolume)}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography><strong>Người hiến:</strong> {viewDetail?.fullName || 'Không có'}</Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDetail(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa đơn vị máu</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc muốn xóa đơn vị máu{" "}
            <strong>ID: {bloodToDelete?.bloodUnitId}</strong>{" "}
            (Nhóm máu: {bloodToDelete?.bloodTypeName}) không?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Hành động này sẽ chuyển đơn vị máu sang trạng thái "Đã loại bỏ".
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={historyDialogOpen} onClose={handleCloseHistoryDialog} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ color: '#e53e3e', fontWeight: 'bold' }}>
          Lịch sử sử dụng đơn vị máu - ID: {selectedBloodHistory?.bloodUnitId}
        </DialogTitle>
        <DialogContent dividers>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress />
            </Box>
          ) : bloodHistory.allHistory.length === 0 ? (
            <Box sx={{ py: 4 }}>
              <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                Chưa có lịch sử sử dụng cho đơn vị máu này.
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
                ID đơn vị máu: {selectedBloodHistory?.bloodUnitId}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.8rem' }}>
                Nhóm máu: {selectedBloodHistory?.bloodTypeName}
              </Typography>
            </Box>
          ) : (
            <>
              {bloodHistory.donationHistory.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2, borderBottom: '2px solid #1976d2', pb: 1 }}>
                    📋 Lịch sử hiến máu ({bloodHistory.donationHistory.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Thành phần</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Thể tích (ml)</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Thời gian</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bloodHistory.donationHistory.map((history, index) => (
                          <TableRow key={`donation-${index}`}>
                            <TableCell sx={{ width: '15%', wordBreak: 'break-word' }}>{history.donationId || 'N/A'}</TableCell>
                            <TableCell sx={{ width: '25%', wordBreak: 'break-word' }}>
                              {history.componentName === 'Plasma' ? 'Huyết tương' :
                               history.componentName === 'Red Blood Cells' ? 'Hồng cầu' :
                               history.componentName === 'Platelets' ? 'Tiểu cầu' :
                               history.componentName === 'Whole Blood' ? 'Máu toàn phần' :
                               history.componentName || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ width: '20%', wordBreak: 'break-word' }}>{history.donationVolume || 0}</TableCell>
                            <TableCell sx={{ width: '40%', wordBreak: 'break-word' }}>
                              {history.assignedDate ? new Date(history.assignedDate).toLocaleString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                              }) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              {bloodHistory.transfusionHistory.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 'bold', mb: 2, borderBottom: '2px solid #2e7d32', pb: 1 }}>
                    🏥 Lịch sử truyền máu ({bloodHistory.transfusionHistory.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e8f5e8' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Thành phần</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Thể tích (ml)</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Thời gian</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bloodHistory.transfusionHistory.map((history, index) => (
                          <TableRow key={`transfusion-${index}`}>
                            <TableCell sx={{ width: '15%', wordBreak: 'break-word' }}>{history.transfusionId || 'N/A'}</TableCell>
                            <TableCell sx={{ width: '25%', wordBreak: 'break-word' }}>
                              {history.componentName === 'Plasma' ? 'Huyết tương' :
                               history.componentName === 'Red Blood Cells' ? 'Hồng cầu' :
                               history.componentName === 'Platelets' ? 'Tiểu cầu' :
                               history.componentName === 'Whole Blood' ? 'Máu toàn phần' :
                               history.componentName || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ width: '20%', wordBreak: 'break-word' }}>{history.assignedVolume || 0}</TableCell>
                            <TableCell sx={{ width: '40%', wordBreak: 'break-word' }}>
                              {history.assignedDate ? new Date(history.assignedDate).toLocaleString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                              }) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
              {bloodHistory.urgentHistory.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ color: '#d32f2f', fontWeight: 'bold', mb: 2, borderBottom: '2px solid #d32f2f', pb: 1 }}>
                    🚨 Lịch sử yêu cầu khẩn cấp ({bloodHistory.urgentHistory.length})
                  </Typography>
                  <TableContainer component={Paper} sx={{ mt: 2 }}>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#ffebee' }}>
                          <TableCell sx={{ fontWeight: 'bold', width: '15%' }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '25%' }}>Thành phần</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '20%' }}>Thể tích (ml)</TableCell>
                          <TableCell sx={{ fontWeight: 'bold', width: '40%' }}>Thời gian</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bloodHistory.urgentHistory.map((history, index) => (
                          <TableRow key={`urgent-${index}`}>
                            <TableCell sx={{ width: '15%', wordBreak: 'break-word' }}>{history.urgentRequestId || 'N/A'}</TableCell>
                            <TableCell sx={{ width: '25%', wordBreak: 'break-word' }}>
                              {history.componentName === 'Plasma' ? 'Huyết tương' :
                               history.componentName === 'Red Blood Cells' ? 'Hồng cầu' :
                               history.componentName === 'Platelets' ? 'Tiểu cầu' :
                               history.componentName === 'Whole Blood' ? 'Máu toàn phần' :
                               history.componentName || 'N/A'}
                            </TableCell>
                            <TableCell sx={{ width: '20%', wordBreak: 'break-word' }}>{history.assignedVolume || 0}</TableCell>
                            <TableCell sx={{ width: '40%', wordBreak: 'break-word' }}>
                              {history.assignedDate ? new Date(history.assignedDate).toLocaleString('vi-VN', {
                                hour: '2-digit', minute: '2-digit', second: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
                              }) : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseHistoryDialog}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};


export default BloodInventory;




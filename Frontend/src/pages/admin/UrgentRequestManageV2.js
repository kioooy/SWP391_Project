import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Box, CircularProgress, Chip, Divider, TextField, Grid, Card, CardContent
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';
import DonorMobilizationComponent from '../DonorMobilizationComponent';

const UrgentRequestManageV2 = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selected, setSelected] = useState(null); // Xem chi tiết
  const [acceptDialog, setAcceptDialog] = useState(false);
  const [componentSelectionDialog, setComponentSelectionDialog] = useState(false);
  const [fulfillDialog, setFulfillDialog] = useState(false);
  const [chosenBloodTypeId, setChosenBloodTypeId] = useState('');
  const [chosenComponentId, setChosenComponentId] = useState('');
  const [availableBloodUnits, setAvailableBloodUnits] = useState({ availableExact: [], availableCompatible: [], reserved: [] });
  const [selectedBloodUnitIds, setSelectedBloodUnitIds] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentRequest, setCurrentRequest] = useState(null);
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailRequest, setDetailRequest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [bloodTypes, setBloodTypes] = useState([]);
  const [components, setComponents] = useState([]);
  const [loadingBloodUnits, setLoadingBloodUnits] = useState(false);
  const [assignedVolumes, setAssignedVolumes] = useState({});
  const [totalVolume, setTotalVolume] = useState('');
  const [fulfillTotalVolume, setFulfillTotalVolume] = useState('');
  const [fulfillData, setFulfillData] = useState([]);
  // 1. Sau khi xác nhận nhóm máu & thành phần, chỉ mở dialog chọn/gán túi máu, không mở fulfillDialog
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignBloodUnits, setAssignBloodUnits] = useState([]);
  const [assignVolumes, setAssignVolumes] = useState({});

  // Bộ lọc states
  const [filters, setFilters] = useState({
    status: '',
    bloodType: '',
    patientName: '',
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);

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
      setFilteredRequests(res.data); // Khởi tạo dữ liệu đã lọc
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách yêu cầu khẩn cấp!', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch blood types
  const fetchBloodTypes = async () => {
    try {
      const res = await axios.get(`${API_URL}/BloodType`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Giữ lại tất cả nhóm máu, bao gồm "Không biết" cho việc lọc
      setBloodTypes(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách nhóm máu:', err);
    }
  };

  // Fetch components
  const fetchComponents = async () => {
    try {
      const res = await axios.get(`${API_URL}/BloodComponent`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComponents(res.data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách thành phần:', err);
    }
  };

  // Fetch urgent request detail
  const fetchRequestDetail = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailRequest(res.data);
      setDetailDialog(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải chi tiết yêu cầu!', severity: 'error' });
    }
  };

  // Fetch suggested blood units
  const fetchSuggestedBloodUnits = async (requestId, bloodTypeId = null, componentId = null) => {
    setLoadingBloodUnits(true);
    try {
      console.log('🔍 Đang gọi API suggest-blood-units cho requestId:', requestId, 'bloodTypeId:', bloodTypeId, 'componentId:', componentId);
      
      // Tạo query parameters
      const params = new URLSearchParams();
      if (bloodTypeId) params.append('bloodTypeId', bloodTypeId);
      if (componentId) params.append('componentId', componentId);
      
      const res = await axios.get(`${API_URL}/UrgentBloodRequest/${requestId}/suggest-blood-units?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('📦 Dữ liệu trả về từ API:', res.data);
      setAvailableBloodUnits(res.data);
    } catch (err) {
      console.error('❌ Lỗi khi gọi API suggest-blood-units:', err);
      setSnackbar({ open: true, message: 'Lỗi khi tải danh sách máu phù hợp!', severity: 'error' });
    } finally {
      setLoadingBloodUnits(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchBloodTypes();
    fetchComponents();
  }, []);

  // Effect để áp dụng bộ lọc khi filters hoặc requests thay đổi
  useEffect(() => {
    applyFilters();
  }, [filters, requests]);

  // Hàm áp dụng bộ lọc
  const applyFilters = () => {
    let filtered = [...requests];

    // Lọc theo trạng thái
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }

    // Lọc theo nhóm máu
    if (filters.bloodType) {
      filtered = filtered.filter(req => req.bloodType?.bloodTypeName === filters.bloodType);
    }

    // Lọc theo tên bệnh nhân
    if (filters.patientName) {
      filtered = filtered.filter(req => 
        req.patientName.toLowerCase().includes(filters.patientName.toLowerCase()) ||
        req.contactName.toLowerCase().includes(filters.patientName.toLowerCase())
      );
    }

    // Lọc theo ngày bắt đầu
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(req => new Date(req.requestDate) >= fromDate);
    }

    // Lọc theo ngày kết thúc
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999); // Cuối ngày
      filtered = filtered.filter(req => new Date(req.requestDate) <= toDate);
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
      dateTo: ''
    });
  };

  // Hàm cập nhật filter
  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Xử lý tiếp nhận
  const handleAccept = async (req) => {
    setCurrentRequest(req);
    if (req.requestedBloodTypeId === 99) {
      // Nếu nhóm máu = "Không biết" → Chọn cả nhóm máu + thành phần
      setAcceptDialog(true);
    } else {
      // Nếu đã biết nhóm máu → Chỉ chọn thành phần
      setChosenBloodTypeId(req.requestedBloodTypeId);
      setComponentSelectionDialog(true);
    }
  };

  // Xem chi tiết
  const handleViewDetail = (req) => {
    fetchRequestDetail(req.urgentRequestId);
  };

  // Hủy yêu cầu
  const handleCancel = async (req) => {
    setSubmitting(true);
    try {
      await axios.patch(`${API_URL}/UrgentBloodRequest/${req.urgentRequestId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Đã hủy yêu cầu!', severity: 'info' });
      fetchRequests(); // Re-fetch data
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi hủy yêu cầu!', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Sau khi staff chọn nhóm máu và thành phần xong (cho trường hợp "Không biết")
  const handleConfirmBloodType = async () => {
    if (!chosenBloodTypeId || !chosenComponentId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn nhóm máu và thành phần!', severity: 'warning' });
      return;
    }
    setAcceptDialog(false);
    try {
      // Gọi API cập nhật nhóm máu thực tế
      await axios.patch(`${API_URL}/UrgentBloodRequest/${currentRequest.urgentRequestId}/actual-blood-type`, {
        requestedBloodTypeId: chosenBloodTypeId
      }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi cập nhật nhóm máu thực tế!', severity: 'error' });
      return;
    }
    // Lấy danh sách máu phù hợp với nhóm máu và thành phần đã chọn
    await fetchSuggestedBloodUnits(currentRequest.urgentRequestId, chosenBloodTypeId, chosenComponentId);
    setAssignBloodUnits([
      ...availableBloodUnits.availableExact,
      ...availableBloodUnits.availableCompatible,
      ...availableBloodUnits.reserved
    ]);
    setAssignVolumes({});
    setAssignDialog(true);
  };

  // Sau khi staff chọn thành phần xong (cho trường hợp đã biết nhóm máu)
  const handleConfirmComponent = async () => {
    if (!chosenBloodTypeId || !chosenComponentId) {
      setSnackbar({ open: true, message: 'Vui lòng chọn nhóm máu và thành phần!', severity: 'warning' });
      return;
    }

    setComponentSelectionDialog(false);
    await fetchSuggestedBloodUnits(currentRequest.urgentRequestId, chosenBloodTypeId, chosenComponentId);
    // KHÔNG mở fulfillDialog ở đây
    // setFulfillDialog(true);
    setAssignBloodUnits([
      ...availableBloodUnits.availableExact,
      ...availableBloodUnits.availableCompatible,
      ...availableBloodUnits.reserved
    ]);
    setAssignVolumes({});
    setAssignDialog(true);
  };

  const getUnitById = (id) => {
    const allUnits = [
      ...availableBloodUnits.availableExact,
      ...availableBloodUnits.availableCompatible,
      ...availableBloodUnits.reserved
    ];
    return allUnits.find(u => u.bloodUnitId === id);
  };

  // Xử lý chọn/bỏ chọn máu
  const handleBloodUnitToggle = (bloodUnitId) => {
    setSelectedBloodUnitIds(prev => {
      if (prev.includes(bloodUnitId)) {
        // Bỏ chọn thì xóa assignedVolume
        const { [bloodUnitId]: _, ...rest } = assignedVolumes;
        setAssignedVolumes(rest);
        return prev.filter(id => id !== bloodUnitId);
      } else {
        // Chọn thì tự động gán assignedVolume sao cho tổng không vượt quá fulfillTotalVolume
        const unit = getUnitById(bloodUnitId);
        let currentTotal = Object.values(assignedVolumes).reduce((a, b) => a + b, 0);
        let remain = Math.max(0, Number(fulfillTotalVolume) - currentTotal);
        let assign = Math.min(unit.remainingVolume, remain);
        if (assign <= 0) {
          setSnackbar({ open: true, message: 'Đã đủ tổng thể tích cần truyền!', severity: 'info' });
          return prev;
        }
        setAssignedVolumes(prevVol => ({ ...prevVol, [bloodUnitId]: assign }));
        return [...prev, bloodUnitId];
      }
    });
  };

  // Xử lý hoàn thành yêu cầu
  const handleFulfill = async () => {
    if (selectedBloodUnitIds.length === 0) {
      setSnackbar({ open: true, message: 'Vui lòng chọn ít nhất một đơn vị máu!', severity: 'warning' });
      return;
    }
    // Kiểm tra assignedVolume
    for (let id of selectedBloodUnitIds) {
      const unit = getUnitById(id);
      const vol = assignedVolumes[id];
      if (!vol || vol < 1 || vol > unit.remainingVolume) {
        setSnackbar({ open: true, message: `Thể tích truyền cho đơn vị máu ID ${id} không hợp lệ!`, severity: 'warning' });
        return;
      }
    }
    setSubmitting(true);
    try {
      // Chuẩn bị dữ liệu để gửi
      const bloodUnits = selectedBloodUnitIds.map(id => {
        const unit = getUnitById(id);
        return {
          bloodUnitId: id,
          assignedVolume: assignedVolumes[id] || unit.remainingVolume,
          componentId: chosenComponentId || null
        };
      });
      console.log('PATCH assign-blood-units payload:', bloodUnits);
      await axios.patch(`${API_URL}/UrgentBloodRequest/${currentRequest.urgentRequestId}/assign-blood-units`, 
        { bloodUnits }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Đã hoàn thành yêu cầu khẩn cấp!', severity: 'success' });
      setFulfillDialog(false);
      setComponentSelectionDialog(false);
      setSelectedBloodUnitIds([]);
      setAssignedVolumes({});
      setCurrentRequest(null);
      setChosenBloodTypeId('');
      setChosenComponentId('');
      fetchRequests(); // Re-fetch data
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi hoàn thành yêu cầu!', severity: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Hàm điều hướng tới trang tìm kiếm máu với thông tin từ yêu cầu khẩn cấp
  const handleNavigateToBloodSearch = () => {
    // Chuẩn bị dữ liệu để truyền qua trang BloodSearch
    const searchParams = {
      recipientBloodTypeId: chosenBloodTypeId,
      component: chosenComponentId,
      requiredVolume: totalVolume,
      fromUrgentRequest: true,
      urgentRequestId: currentRequest?.urgentRequestId,
      patientName: currentRequest?.patientName
    };
    
    // Lưu vào sessionStorage để trang BloodSearch có thể đọc
    sessionStorage.setItem('urgentRequestSearchParams', JSON.stringify(searchParams));
    
    // Điều hướng tới trang BloodSearch
    navigate('/blood-search');
  };

  // Hàm helper để hiển thị trạng thái
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Pending':
        return { text: 'Chờ duyệt', color: '#e6a700' };
      case 'InProgress':
        return { text: 'Đang xử lý', color: '#1976d2' };
      case 'Fulfilled':
        return { text: 'Đã hoàn thành', color: '#388e3c' };
      case 'Cancelled':
        return { text: 'Đã hủy', color: '#d32f2f' };
      default:
        return { text: status, color: '#666' };
    }
  };

  // Hàm helper để dịch tên thành phần máu sang tiếng Việt
  const translateComponentName = (componentName) => {
    const translations = {
      'Whole Blood': 'Máu toàn phần',
      'Red Blood Cells': 'Hồng cầu',
      'Plasma': 'Huyết tương',
      'Platelets': 'Tiểu cầu'
    };
    return translations[componentName] || componentName;
  };

  // Hàm helper để hiển thị danh sách máu
  const renderBloodUnitsList = (units, title, color) => {
    if (units.length === 0) return null;

    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ color, mb: 1 }}>
          {title} ({units.length})
        </Typography>
        {units.map((unit) => (
          <Box key={unit.bloodUnitId} sx={{ 
            border: '1px solid #ddd', 
            borderRadius: 1, 
            p: 1, 
            mb: 1,
            backgroundColor: selectedBloodUnitIds.includes(unit.bloodUnitId) ? '#e3f2fd' : 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={selectedBloodUnitIds.includes(unit.bloodUnitId)}
                onChange={() => handleBloodUnitToggle(unit.bloodUnitId)}
                disabled={unit.bloodStatus === 'Reserved'}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2">
                  <strong>ID:</strong> {unit.bloodUnitId} | 
                  <strong> Nhóm máu:</strong> {unit.bloodTypeName} | 
                  <strong> Thành phần:</strong> {translateComponentName(unit.componentName)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Thể tích:</strong> {unit.remainingVolume}ml / {unit.volume}ml | 
                  <strong> Hết hạn:</strong> {new Date(unit.expiryDate).toLocaleDateString('vi-VN')} | 
                  <strong> Trạng thái:</strong> {unit.bloodStatus}
                </Typography>
              </Box>
              {selectedBloodUnitIds.includes(unit.bloodUnitId) && (
                <TextField
                  type="number"
                  size="small"
                  label="Thể tích truyền (ml)"
                  value={assignedVolumes[unit.bloodUnitId] || ''}
                  onChange={e => {
                    let value = Math.max(1, Math.min(unit.remainingVolume, Number(e.target.value)));
                    // Không cho tổng vượt quá fulfillTotalVolume
                    let otherTotal = Object.entries(assignedVolumes).filter(([k]) => Number(k) !== unit.bloodUnitId).reduce((a, [_, b]) => a + b, 0);
                    if (value + otherTotal > Number(fulfillTotalVolume)) {
                      value = Math.max(1, Number(fulfillTotalVolume) - otherTotal);
                    }
                    setAssignedVolumes(prev => ({ ...prev, [unit.bloodUnitId]: value }));
                  }}
                  inputProps={{ min: 1, max: Math.min(unit.remainingVolume, Number(fulfillTotalVolume)), step: 1 }}
                  sx={{ width: 120, ml: 2 }}
                />
              )}
            </Box>
          </Box>
        ))}
      </Box>
    );
  };

  const totalAssigned = Object.values(assignedVolumes).reduce((a, b) => a + b, 0);

  // Thêm hàm handleOpenFulfill
  const handleOpenFulfill = async (req) => {
    setCurrentRequest(req);
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest/${req.urgentRequestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailRequest(res.data);
      // Khởi tạo fulfillData với assignedBloodUnits
      if (Array.isArray(res.data.assignedBloodUnits)) {
        setFulfillData(res.data.assignedBloodUnits.map(unit => ({
          bloodUnitId: unit.bloodUnitId,
          usedVolume: unit.assignedVolume,
          maxVolume: unit.assignedVolume
        })));
      } else {
        setFulfillData([]);
      }
      setFulfillDialog(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải chi tiết yêu cầu!', severity: 'error' });
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#E53935' }}>
        Quản Lý Yêu Cầu Máu Khẩn Cấp
      </Typography>

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
                disabled={!filters.status && !filters.bloodType && !filters.patientName && !filters.dateFrom && !filters.dateTo}
              >
                Xóa bộ lọc
              </Button>
            </Box>
          </Box>

          {showFilters && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filters.status}
                    onChange={(e) => updateFilter('status', e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="Pending">Chờ duyệt</MenuItem>
                    <MenuItem value="InProgress">Đang xử lý</MenuItem>
                    <MenuItem value="Fulfilled">Đã hoàn thành</MenuItem>
                    <MenuItem value="Cancelled">Đã hủy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Nhóm máu</InputLabel>
                  <Select
                    value={filters.bloodType}
                    onChange={(e) => updateFilter('bloodType', e.target.value)}
                    label="Nhóm máu"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {bloodTypes.map((bt) => (
                      <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeName}>
                        {bt.bloodTypeName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tên bệnh nhân/người liên hệ"
                  value={filters.patientName}
                  onChange={(e) => updateFilter('patientName', e.target.value)}
                  placeholder="Nhập tên để tìm kiếm..."
                />
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
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

              <Grid item xs={12} sm={6} md={2.4}>
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
            {(filters.status || filters.bloodType || filters.patientName || filters.dateFrom || filters.dateTo) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {filters.status && (
                  <Chip 
                    label={`Trạng thái: ${getStatusDisplay(filters.status).text}`} 
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

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, mt: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredRequests.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Không có dữ liệu
            </Typography>
          </Box>
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
              {filteredRequests
                .sort((a, b) => {
                  // Sắp xếp theo ngày yêu cầu (mới nhất lên đầu)
                  if (a.requestDate && b.requestDate) {
                    return new Date(b.requestDate) - new Date(a.requestDate);
                  }
                  // Nếu không có ngày thì sắp xếp theo ID (lớn nhất lên đầu)
                  return (b.urgentRequestId || 0) - (a.urgentRequestId || 0);
                })
                .map((r) => {
                const statusInfo = getStatusDisplay(r.status);
                return (
                  <TableRow key={r.urgentRequestId}>
                    <TableCell>{r.patientName}</TableCell>
                    <TableCell>{r.bloodType?.bloodTypeName || '-'}</TableCell>
                    <TableCell>{r.reason}</TableCell>
                    <TableCell>{r.contactName}</TableCell>
                    <TableCell>{r.contactPhone}</TableCell>
                    <TableCell>{r.citizenNumber || '-'}</TableCell>
                    <TableCell>{new Date(r.requestDate).toLocaleString('vi-VN')}</TableCell>
                    <TableCell>
                      <span style={{ color: statusInfo.color, fontWeight: 600 }}>
                        {statusInfo.text}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                        <Button size="small" color="info" variant="outlined" onClick={() => handleViewDetail(r)} sx={{ minWidth: 100, height: 36 }}>
                          Xem chi tiết
                        </Button>
                        {r.status === 'Pending' && (
                          <Button 
                            size="small" 
                            color="success" 
                            variant="contained" 
                            onClick={() => handleAccept(r)} 
                            sx={{ minWidth: 100, height: 36 }} 
                            disabled={submitting}
                          >
                            Tiếp nhận
                          </Button>
                        )}
                        {r.status === 'InProgress' && (
                          <Button 
                            size="small" 
                            color="primary" 
                            variant="contained" 
                            onClick={() => handleOpenFulfill(r)} 
                            sx={{ minWidth: 100, height: 36 }} 
                            disabled={submitting}
                          >
                            Hoàn thành
                          </Button>
                        )}
                        <Button 
                          size="small" 
                          color="error" 
                          variant="contained" 
                          onClick={() => handleCancel(r)} 
                          sx={{ minWidth: 100, height: 36 }} 
                          disabled={r.status === 'Fulfilled' || r.status === 'Cancelled' || submitting}
                        >
                          Hủy
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Dialog xem chi tiết yêu cầu */}
      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chi tiết yêu cầu máu khẩn</DialogTitle>
        <DialogContent>
          {detailRequest && (
            <Box sx={{ fontSize: 16, color: '#222', display: 'grid', rowGap: 1 }}>
              <div><b>Mã yêu cầu:</b> {detailRequest.urgentRequestId}</div>
              <div><b>Tên bệnh nhân:</b> {detailRequest.patientName}</div>
              <div><b>Nhóm máu:</b> {detailRequest.bloodType?.bloodTypeName || '-'}</div>
              <div><b>Lý do:</b> {detailRequest.reason}</div>
              <div><b>Người liên hệ:</b> {detailRequest.contactName}</div>
              <div><b>Số điện thoại:</b> {detailRequest.contactPhone}</div>
              <div><b>Email:</b> {detailRequest.contactEmail || '-'}</div>
              <div><b>CCCD:</b> {detailRequest.citizenNumber || '-'}</div>
              <div><b>Địa chỉ:</b> {detailRequest.emergencyLocation}</div>
              <div><b>Ghi chú:</b> {detailRequest.notes || '-'}</div>
              <div><b>Ngày yêu cầu:</b> {new Date(detailRequest.requestDate).toLocaleString('vi-VN')}</div>
              <div><b>Trạng thái:</b> {getStatusDisplay(detailRequest.status).text}</div>
              {detailRequest.completionDate && (
                <div><b>Ngày hoàn thành:</b> {new Date(detailRequest.completionDate).toLocaleString('vi-VN')}</div>
              )}
              <Divider sx={{ my: 2 }} />
              <div><b>Danh sách máu đã gán:</b></div>
              {Array.isArray(detailRequest.assignedBloodUnits) && detailRequest.assignedBloodUnits.length > 0 ? (
                <Box sx={{ pl: 1 }}>
                  {detailRequest.assignedBloodUnits.map((unit, idx) => (
                    <Box key={unit.bloodUnitId || idx} sx={{ mb: 1, p: 1, border: '1px solid #eee', borderRadius: 1 }}>
                      <div><b>ID:</b> {unit.bloodUnitId}</div>
                      <div><b>Nhóm máu:</b> {unit.bloodTypeName}</div>
                      <div><b>Thành phần:</b> {unit.componentName}</div>
                      <div><b>Thể tích gán:</b> {unit.assignedVolume}ml</div>
                      <div><b>Trạng thái túi máu:</b> {unit.bloodStatus === 'Reserved' ? 'Đã đặt chỗ' : unit.bloodStatus === 'Available' ? 'Có sẵn' : unit.bloodStatus === 'Used' ? 'Đã sử dụng' : unit.bloodStatus}</div>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 1 }}>
                  {typeof detailRequest.assignedBloodUnits === 'string' ? detailRequest.assignedBloodUnits : 'Không có đơn vị máu nào đã được gán cho yêu cầu này.'}
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn nhóm máu & thành phần nếu chưa biết */}
      <Dialog open={acceptDialog} onClose={() => setAcceptDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn nhóm máu & thành phần cho bệnh nhân</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Bệnh nhân chưa biết nhóm máu. Vui lòng chọn nhóm máu và thành phần phù hợp.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nhóm máu</InputLabel>
              <Select
                value={chosenBloodTypeId}
                onChange={(e) => setChosenBloodTypeId(e.target.value)}
                label="Nhóm máu"
              >
                {bloodTypes.filter(bt => bt.bloodTypeId !== 99).map((bt) => (
                  <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>
                    {bt.bloodTypeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Thành phần</InputLabel>
              <Select
                value={chosenComponentId}
                onChange={(e) => setChosenComponentId(e.target.value)}
                label="Thành phần"
              >
                {components.map((comp) => (
                  <MenuItem key={comp.componentId} value={comp.componentId}>
                    {translateComponentName(comp.componentName)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <TextField
                label="Tổng thể tích cần truyền (ml)"
                type="number"
                value={totalVolume}
                onChange={e => setTotalVolume(e.target.value.replace(/[^0-9]/g, ''))}
                inputProps={{ min: 1, step: 1 }}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAcceptDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!chosenBloodTypeId || !chosenComponentId || !totalVolume || Number(totalVolume) < 1}
            onClick={handleConfirmBloodType}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn thành phần khi đã biết nhóm máu */}
      <Dialog open={componentSelectionDialog} onClose={() => setComponentSelectionDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Chọn thành phần máu cho bệnh nhân</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Nhóm máu gợi ý từ yêu cầu: <strong>{bloodTypes.find(bt => bt.bloodTypeId === currentRequest?.requestedBloodTypeId)?.bloodTypeName}</strong>
          </Alert>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nhóm máu</InputLabel>
              <Select
                value={chosenBloodTypeId}
                onChange={(e) => setChosenBloodTypeId(e.target.value)}
                label="Nhóm máu"
              >
                {bloodTypes.filter(bt => bt.bloodTypeId !== 99).map((bt) => (
                  <MenuItem key={bt.bloodTypeId} value={bt.bloodTypeId}>
                    {bt.bloodTypeName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl fullWidth>
              <InputLabel>Thành phần</InputLabel>
              <Select
                value={chosenComponentId}
                onChange={(e) => setChosenComponentId(e.target.value)}
                label="Thành phần"
              >
                {components.map((comp) => (
                  <MenuItem key={comp.componentId} value={comp.componentId}>
                    {translateComponentName(comp.componentName)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <TextField
                label="Tổng thể tích cần truyền (ml)"
                type="number"
                value={totalVolume}
                onChange={e => setTotalVolume(e.target.value.replace(/[^0-9]/g, ''))}
                inputProps={{ min: 1, step: 1 }}
              />
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComponentSelectionDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!chosenBloodTypeId || !chosenComponentId || !totalVolume || Number(totalVolume) < 1}
            onClick={handleConfirmComponent}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn máu để hoàn thành (cũ) */}
      {/* Thay thế bằng dialog hoàn thành mới */}
      <Dialog open={fulfillDialog} onClose={() => setFulfillDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu truyền máu</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Lưu ý: Thể tích thực tế truyền có thể nhỏ hơn hoặc bằng dung tích đã gán. Vui lòng nhập đúng số ml máu đã truyền cho từng túi máu.
          </Alert>
          {fulfillData.length === 0 ? (
            <Alert severity="info">Không có đơn vị máu nào đã gán cho yêu cầu này.</Alert>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {fulfillData.map((item, idx) => (
                <Box key={item.bloodUnitId} sx={{ border: '1px solid #eee', borderRadius: 1, p: 1 }}>
                  <div><b>ID:</b> {item.bloodUnitId}</div>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      label="Thể tích đã truyền (ml)"
                      type="number"
                      value={item.usedVolume}
                      onChange={e => {
                        let value = Math.max(0, Math.min(item.maxVolume, Number(e.target.value)));
                        setFulfillData(prev => prev.map((d, i) => i === idx ? { ...d, usedVolume: value } : d));
                      }}
                      inputProps={{ min: 0, max: item.maxVolume, step: 1 }}
                      sx={{ width: 200, mt: 1, mb: 1 }}
                    />
                    <span>/ {item.maxVolume}ml</span>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={fulfillData.length === 0 || submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await axios.patch(`${API_URL}/UrgentBloodRequest/${currentRequest.urgentRequestId}/fulfill`, fulfillData.map(d => ({
                  bloodUnitId: d.bloodUnitId,
                  usedVolume: d.usedVolume
                })), { headers: { Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: 'Đã hoàn thành yêu cầu truyền máu!', severity: 'success' });
                setFulfillDialog(false);
                setCurrentRequest(null);
                fetchRequests();
              } catch (err) {
                setSnackbar({ open: true, message: 'Lỗi khi hoàn thành yêu cầu!', severity: 'error' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Xác nhận hoàn thành
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn/gán túi máu */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chọn và gán túi máu cho bệnh nhân: {currentRequest?.patientName || detailRequest?.patientName || ''}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle1">
              Tổng thể tích cần truyền: <strong>{totalVolume} ml</strong>
            </Typography>
            <Typography variant="subtitle1" color="primary">
              Đã chọn: <strong>{Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0)} ml</strong>
              <span style={{ color: 'gray' }}> / {totalVolume} ml</span>
            </Typography>
          </Box>
          {availableBloodUnits.availableExact.length === 0 && availableBloodUnits.availableCompatible.length === 0 ? (
            <Box>
              <Alert severity="warning" sx={{ mb: 2 }}>
                Không có máu phù hợp nào sẵn sàng trong kho. 
              </Alert>
              <Alert severity="info" sx={{ mb: 2 }}>
                Bạn có thể chuyển sang trang <strong>"Tìm kiếm máu"</strong> để tìm kiếm trong kho tổng và huy động người hiến phù hợp.
              </Alert>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={handleNavigateToBloodSearch}
                fullWidth
                sx={{ mt: 1 }}
              >
                Chuyển tới trang tìm kiếm máu
              </Button>
              
              {/* Component huy động người hiến khi không có máu phù hợp */}
              <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2, bgcolor: '#fafafa' }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', fontWeight: 'bold' }}>
                  🚨 Huy động cộng đồng hiến máu
                </Typography>
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  Không tìm thấy máu phù hợp trong kho. Bạn có thể gửi thông báo để huy động cộng đồng hiến máu ngay tại đây.
                </Typography>
                <DonorMobilizationComponent 
                  embedded={true}
                  bloodType={bloodTypes.find(bt => bt.bloodTypeId == chosenBloodTypeId)?.bloodTypeName || ""}
                  onNotified={(donorsList) => {
                    setSnackbar({
                      open: true,
                      message: `Đã gửi thông báo huy động thành công tới ${donorsList.length} người hiến máu! Hãy chờ phản hồi từ cộng đồng.`,
                      severity: "success",
                    });
                  }}
                />
              </Box>
            </Box>
          ) : (
            <Box>
              {availableBloodUnits.availableExact.length > 0 && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ color: '#388e3c', mb: 1, borderBottom: '2px solid #388e3c', pb: 0.5 }}>
      Túi máu chính xác ({availableBloodUnits.availableExact.length})
    </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {availableBloodUnits.availableExact.map((unit) => (
                      <Box key={unit.bloodUnitId} sx={{ border: '1px solid #eee', borderRadius: 1, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, background: assignVolumes[unit.bloodUnitId] ? '#f5fafd' : 'white' }}>
                  <Checkbox
                    checked={!!assignVolumes[unit.bloodUnitId]}
                    onChange={e => {
                            if (e.target.checked) {
                              const currentTotal = Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0);
                              const remainingVolume = Number(totalVolume) - currentTotal;
                              if (remainingVolume <= 0) {
                                setSnackbar({ open: true, message: 'Đã đạt đủ tổng thể tích cần truyền!', severity: 'warning' });
                                return;
                              }
                              const assignVolume = Math.min(unit.remainingVolume, remainingVolume);
                              setAssignVolumes(prev => ({ ...prev, [unit.bloodUnitId]: assignVolume }));
                            } else {
                              setAssignVolumes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => Number(k) !== unit.bloodUnitId)));
                            }
                          }}
                          disabled={!assignVolumes[unit.bloodUnitId] && Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0) >= Number(totalVolume)}
                          sx={{ mt: 1 }}
                  />
                        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, rowGap: 0.5, columnGap: 2 }}>
                          <div><b>ID:</b> {unit.bloodUnitId}</div>
                          <div><b>Nhóm máu:</b> {unit.bloodTypeName}</div>
                          <div><b>Thành phần:</b> {unit.componentName}</div>
                          <div><b>Thể tích gốc:</b> {unit.volume}ml</div>
                          <div><b>Thể tích còn lại:</b> {unit.remainingVolume}ml</div>
                          <div><b>Hạn sử dụng:</b> {new Date(unit.expiryDate).toLocaleDateString('vi-VN')}</div>
                          <div><b>Trạng thái:</b> {unit.bloodStatus === 'Reserved' ? 'Đã đặt chỗ' : unit.bloodStatus === 'Available' ? 'Có sẵn' : unit.bloodStatus === 'Used' ? 'Đã sử dụng' : unit.bloodStatus}</div>
                        </Box>
                  {assignVolumes[unit.bloodUnitId] && (
                    <TextField
                      label="Thể tích gán (ml)"
                      type="number"
                      value={assignVolumes[unit.bloodUnitId]}
                      onChange={e => {
                              const currentTotal = Object.entries(assignVolumes).filter(([id]) => Number(id) !== unit.bloodUnitId).reduce((sum, [_, vol]) => sum + vol, 0);
                              const maxAllowed = Number(totalVolume) - currentTotal;
                              let value = Math.max(1, Math.min(unit.remainingVolume, Number(e.target.value), maxAllowed));
                        setAssignVolumes(prev => ({ ...prev, [unit.bloodUnitId]: value }));
                      }}
                            inputProps={{ min: 1, max: Math.min(unit.remainingVolume, Number(totalVolume)), step: 1 }}
                            sx={{ width: 120, ml: 2, mt: 1 }}
                    />
                  )}
                </Box>
              ))}
                  </Box>
                </Box>
              )}
              {availableBloodUnits.availableCompatible.length > 0 && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="h6" sx={{ color: '#1976d2', mb: 1, borderBottom: '2px solid #1976d2', pb: 0.5 }}>
      Túi máu tương thích ({availableBloodUnits.availableCompatible.length})
    </Typography>
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {availableBloodUnits.availableCompatible.map((unit) => (
                      <Box key={unit.bloodUnitId} sx={{ border: '1px solid #eee', borderRadius: 1, p: 2, display: 'flex', alignItems: 'flex-start', gap: 2, background: assignVolumes[unit.bloodUnitId] ? '#f5fafd' : 'white' }}>
                        <Checkbox
                          checked={!!assignVolumes[unit.bloodUnitId]}
                          onChange={e => {
                            if (e.target.checked) {
                              const currentTotal = Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0);
                              const remainingVolume = Number(totalVolume) - currentTotal;
                              if (remainingVolume <= 0) {
                                setSnackbar({ open: true, message: 'Đã đạt đủ tổng thể tích cần truyền!', severity: 'warning' });
                                return;
                              }
                              const assignVolume = Math.min(unit.remainingVolume, remainingVolume);
                              setAssignVolumes(prev => ({ ...prev, [unit.bloodUnitId]: assignVolume }));
                            } else {
                              setAssignVolumes(prev => Object.fromEntries(Object.entries(prev).filter(([k]) => Number(k) !== unit.bloodUnitId)));
                            }
                          }}
                          disabled={!assignVolumes[unit.bloodUnitId] && Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0) >= Number(totalVolume)}
                          sx={{ mt: 1 }}
                        />
                        <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, rowGap: 0.5, columnGap: 2 }}>
                          <div><b>ID:</b> {unit.bloodUnitId}</div>
                          <div><b>Nhóm máu:</b> {unit.bloodTypeName}</div>
                          <div><b>Thành phần:</b> {unit.componentName}</div>
                          <div><b>Thể tích gốc:</b> {unit.volume}ml</div>
                          <div><b>Thể tích còn lại:</b> {unit.remainingVolume}ml</div>
                          <div><b>Hạn sử dụng:</b> {new Date(unit.expiryDate).toLocaleDateString('vi-VN')}</div>
                          <div><b>Trạng thái:</b> {unit.bloodStatus === 'Reserved' ? 'Đã đặt chỗ' : unit.bloodStatus === 'Available' ? 'Có sẵn' : unit.bloodStatus === 'Used' ? 'Đã sử dụng' : unit.bloodStatus}</div>
                        </Box>
                        {assignVolumes[unit.bloodUnitId] && (
                          <TextField
                            label="Thể tích gán (ml)"
                            type="number"
                            value={assignVolumes[unit.bloodUnitId]}
                            onChange={e => {
                              const currentTotal = Object.entries(assignVolumes).filter(([id]) => Number(id) !== unit.bloodUnitId).reduce((sum, [_, vol]) => sum + vol, 0);
                              const maxAllowed = Number(totalVolume) - currentTotal;
                              let value = Math.max(1, Math.min(unit.remainingVolume, Number(e.target.value), maxAllowed));
                              setAssignVolumes(prev => ({ ...prev, [unit.bloodUnitId]: value }));
                            }}
                            inputProps={{ min: 1, max: Math.min(unit.remainingVolume, Number(totalVolume)), step: 1 }}
                            sx={{ width: 120, ml: 2, mt: 1 }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignDialog(false)}>Hủy</Button>
          <Button
            variant="contained"
            color="primary"
            disabled={Object.keys(assignVolumes).length === 0 || submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                const bloodUnits = Object.entries(assignVolumes).map(([id, vol]) => {
                   const unit = assignBloodUnits.find(u => Number(u.bloodUnitId) === Number(id));
                  return {
                    bloodUnitId: Number(id),
                     assignedVolume: Number(vol),
                     componentId: unit && unit.componentId ? Number(unit.componentId) : Number(chosenComponentId)
                  };
                });
                 console.log('📤 Gán máu:', JSON.stringify(bloodUnits));
                await axios.patch(`${API_URL}/UrgentBloodRequest/${currentRequest.urgentRequestId}/assign-blood-units`, { bloodUnits }, { headers: { Authorization: `Bearer ${token}` } });
                setSnackbar({ open: true, message: 'Đã gán máu cho yêu cầu thành công!', severity: 'success' });
                setAssignDialog(false);
                fetchRequests();
              } catch (err) {
                 if (err.response) {
                   console.log('BE error:', err.response.data);
                 }
                setSnackbar({ open: true, message: 'Lỗi khi gán máu!', severity: 'error' });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            Gán máu
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

export default UrgentRequestManageV2; 
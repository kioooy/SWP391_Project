import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, Box, CircularProgress, Chip, Divider, TextField, Grid, Card, CardContent, Tabs, Tab
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';
import axios from 'axios';


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
  // 1. Sau khi xác nhận nhóm máu & thành phần, chỉ mở dialog chọn/gán túi máu, không mở fulfillDialog
  const [assignDialog, setAssignDialog] = useState(false);
  const [assignBloodUnits, setAssignBloodUnits] = useState([]);
  const [assignVolumes, setAssignVolumes] = useState({});
  const [currentTab, setCurrentTab] = useState(0); // State để quản lý tab hiện tại

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

  // ==========================================
  // LOGIC XỬ LÝ TIÊU CHÍ CHỌN MÁU KHẨN CẤP
  // ==========================================
  // 
  // Hàm này gọi API để lấy danh sách máu theo 4 tiêu chí ưu tiên:
  // 1. availableExact: Máu cùng nhóm (AB+ cho AB+)
  // 2. availableCompatible: Máu tương thích (A+ cho AB+)
  // 3. reserved: Máu đã đặt chỗ (cần cân nhắc)
  // 4. eligibleDonors: Người hiến gần đó (bán kính 20km)
  //
  // API sẽ trả về cấu trúc:
  // {
  //   availableExact: [máu cùng nhóm],
  //   availableCompatible: [máu tương thích], 
  //   reserved: [máu đã đặt chỗ],
  //   eligibleDonors: [người hiến gần đó]
  // }
  // ==========================================
  
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
      
      // Cập nhật danh sách máu để gán
      const allBloodUnits = [
        ...res.data.availableExact,
        ...res.data.availableCompatible,
        ...res.data.reserved
      ];
      setAssignBloodUnits(allBloodUnits);
      
      // Kiểm tra nếu không có máu trong kho thì hiển thị thông báo
      if (allBloodUnits.length === 0 && res.data.eligibleDonors && res.data.eligibleDonors.length > 0) {
        setSnackbar({ 
          open: true, 
          message: `Không có máu phù hợp trong kho. Tìm thấy ${res.data.eligibleDonors.length} người hiến máu trong bán kính 20km.`, 
          severity: 'info' 
        });
      }
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
        // Chọn thì tự động gán assignedVolume sao cho tổng không vượt quá totalVolume
        const unit = getUnitById(bloodUnitId);
        let currentTotal = Object.values(assignedVolumes).reduce((a, b) => a + b, 0);
        let remain = Math.max(0, Number(totalVolume) - currentTotal);
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
                    // Không cho tổng vượt quá totalVolume
                    let otherTotal = Object.entries(assignedVolumes).filter(([k]) => Number(k) !== unit.bloodUnitId).reduce((a, [_, b]) => a + b, 0);
                    if (value + otherTotal > Number(totalVolume)) {
                      value = Math.max(1, Number(totalVolume) - otherTotal);
                    }
                    setAssignedVolumes(prev => ({ ...prev, [unit.bloodUnitId]: value }));
                  }}
                  inputProps={{ min: 1, max: Math.min(unit.remainingVolume, Number(totalVolume)), step: 1 }}
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

  // Hàm mở dialog hoàn thành yêu cầu
  const handleOpenFulfill = async (req) => {
    setCurrentRequest(req);
    try {
      const res = await axios.get(`${API_URL}/UrgentBloodRequest/${req.urgentRequestId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDetailRequest(res.data);
      setFulfillDialog(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Lỗi khi tải chi tiết yêu cầu!', severity: 'error' });
    }
  };

  // Hàm xử lý thay đổi tab
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
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
                      <div><b>Thành phần:</b> {translateComponentName(unit.componentName)}</div>
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

      {/* Dialog hoàn thành yêu cầu - Đơn giản hóa */}
      <Dialog open={fulfillDialog} onClose={() => setFulfillDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hoàn thành yêu cầu truyền máu</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Hệ thống sẽ tự động sử dụng toàn bộ lượng máu đã được gán cho yêu cầu này.
          </Alert>
          
          {detailRequest && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                Thông tin yêu cầu
              </Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 1, mb: 2 }}>
                <Typography><strong>Bệnh nhân:</strong> {detailRequest.patientName}</Typography>
                <Typography><strong>Nhóm máu:</strong> {detailRequest.bloodType?.bloodTypeName}</Typography>
                <Typography><strong>Người liên hệ:</strong> {detailRequest.contactName} - {detailRequest.contactPhone}</Typography>
                <Typography><strong>Địa chỉ:</strong> {detailRequest.emergencyLocation}</Typography>
              </Box>
            </Box>
          )}

          {detailRequest && Array.isArray(detailRequest.assignedBloodUnits) && detailRequest.assignedBloodUnits.length > 0 ? (
            <Box>
              <Typography variant="h6" sx={{ mb: 2, color: '#388e3c' }}>
                Danh sách máu sẽ được sử dụng
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {detailRequest.assignedBloodUnits.map((unit, idx) => (
                  <Box key={unit.bloodUnitId || idx} sx={{ 
                    border: '2px solid #4caf50', 
                    borderRadius: 2, 
                    p: 2,
                    bgcolor: '#f1f8e9'
                  }}>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography><strong>ID túi máu:</strong> {unit.bloodUnitId}</Typography>
                        <Typography><strong>Nhóm máu:</strong> {unit.bloodTypeName}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography><strong>Thành phần:</strong> {translateComponentName(unit.componentName)}</Typography>
                        <Typography><strong>Thể tích sử dụng:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{unit.assignedVolume}ml</span></Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
              
              <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                <Typography variant="h6" color="primary">
                  <strong>Tổng thể tích sẽ sử dụng: {detailRequest.assignedBloodUnits.reduce((sum, unit) => sum + unit.assignedVolume, 0)}ml</strong>
                </Typography>
              </Box>
            </Box>
          ) : (
            <Alert severity="warning">
              Không có đơn vị máu nào đã được gán cho yêu cầu này. Vui lòng gán máu trước khi hoàn thành.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFulfillDialog(false)} color="inherit">
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            disabled={!detailRequest || !Array.isArray(detailRequest.assignedBloodUnits) || detailRequest.assignedBloodUnits.length === 0 || submitting}
            onClick={async () => {
              setSubmitting(true);
              try {
                await axios.patch(`${API_URL}/UrgentBloodRequest/${currentRequest.urgentRequestId}/fulfill`, {}, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                setSnackbar({ 
                  open: true, 
                  message: 'Đã hoàn thành yêu cầu truyền máu thành công!', 
                  severity: 'success' 
                });
                setFulfillDialog(false);
                setCurrentRequest(null);
                setDetailRequest(null);
                fetchRequests();
              } catch (err) {
                console.error('Lỗi khi hoàn thành yêu cầu:', err);
                setSnackbar({ 
                  open: true, 
                  message: err.response?.data?.error || 'Lỗi khi hoàn thành yêu cầu!', 
                  severity: 'error' 
                });
              } finally {
                setSubmitting(false);
              }
            }}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            {submitting ? 'Đang xử lý...' : 'Xác nhận hoàn thành'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog chọn/gán túi máu */}
      <Dialog open={assignDialog} onClose={() => setAssignDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb: 1.5 }}>
          <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
            Chọn và gán túi máu cho bệnh nhân: {currentRequest?.patientName || detailRequest?.patientName || ''}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 1.5 }}>
          <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 0.75, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
              Tổng thể tích cần truyền: <strong>{totalVolume} ml</strong>
            </Typography>
            <Typography variant="body2" color="primary" sx={{ fontSize: '0.9rem' }}>
              Đã chọn: <strong>{Object.values(assignVolumes).reduce((sum, vol) => sum + vol, 0)} ml</strong>
              <span style={{ color: 'gray' }}> / {totalVolume} ml</span>
            </Typography>
          </Box>

          {/* ==========================================
          TIÊU CHÍ CHỌN MÁU CHO YÊU CẦU MÁU KHẨN CẤP
          ==========================================
          
          Hệ thống áp dụng 4 tiêu chí ưu tiên theo thứ tự:
          
          1️⃣ MÁU CÙNG NHÓM (tốt nhất)
             - Ưu tiên cao nhất: AB+ cho AB+, A+ cho A+, B+ cho B+, O+ cho O+
             - An toàn nhất, ít rủi ro nhất
             - Ví dụ: Bệnh nhân AB+ → Chọn máu AB+
          
          2️⃣ MÁU TƯƠNG THÍCH
             - Áp dụng quy tắc tương thích máu
             - AB+ nhận được: AB+, A+, B+, O+
             - A+ nhận được: A+, O+
             - B+ nhận được: B+, O+
             - O+ chỉ nhận được: O+
          
          3️⃣ MÁU ĐÃ ĐẶT CHỖ
             - Sử dụng máu đã được đặt chỗ cho yêu cầu khác
             - Cần cân nhắc mức độ khẩn cấp
          
          4️⃣ HUY ĐỘNG NGƯỜI HIẾN
             - Tìm người hiến máu trong bán kính 20km
             - Gửi thông báo khẩn cấp
             - Chờ phản hồi từ cộng đồng
          ========================================== */}
          
          {/* Thông báo hướng dẫn về thứ tự ưu tiên */}
          <Alert severity="info" sx={{ mb: 1.5, py: 0.75 }}>
            <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
              <strong>Hướng dẫn chọn máu:</strong>
              <br />1️⃣ <strong>Máu cùng nhóm</strong> (tốt nhất) → 2️⃣ <strong>Máu tương thích</strong> → 3️⃣ <strong>Máu đã đặt chỗ</strong> → 4️⃣ <strong>Huy động người hiến</strong>
            </Typography>
          </Alert>

          {loadingBloodUnits ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Thông tin tổng quan về tình trạng máu */}
              <Box sx={{ mb: 2.5, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
                <Typography variant="body1" sx={{ mb: 1.5, color: '#495057', fontWeight: 'bold', fontSize: '0.9rem' }}>
                  📊 Tổng quan tình trạng máu
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: '#e8f5e8', borderRadius: 1, border: '1px solid #4caf50' }}>
                      <Typography variant="h6" color="#2e7d32" sx={{ fontSize: '1.1rem', mb: 0 }}>
                        {availableBloodUnits.availableExact?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="#2e7d32" sx={{ fontSize: '0.8rem' }}>
                        Máu cùng nhóm
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: '#e3f2fd', borderRadius: 1, border: '1px solid #2196f3' }}>
                      <Typography variant="h6" color="#1976d2" sx={{ fontSize: '1.1rem', mb: 0 }}>
                        {availableBloodUnits.availableCompatible?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="#1976d2" sx={{ fontSize: '0.8rem' }}>
                        Máu tương thích
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: '#fff3e0', borderRadius: 1, border: '1px solid #ff9800' }}>
                      <Typography variant="h6" color="#f57c00" sx={{ fontSize: '1.1rem', mb: 0 }}>
                        {availableBloodUnits.reserved?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="#f57c00" sx={{ fontSize: '0.8rem' }}>
                        Máu đã đặt chỗ
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Box sx={{ textAlign: 'center', p: 0.75, bgcolor: '#ffebee', borderRadius: 1, border: '1px solid #f44336' }}>
                      <Typography variant="h6" color="#d32f2f" sx={{ fontSize: '1.1rem', mb: 0 }}>
                        {availableBloodUnits.eligibleDonors?.length || 0}
                      </Typography>
                      <Typography variant="body2" color="#d32f2f" sx={{ fontSize: '0.8rem' }}>
                        Người hiến gần đây
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              {/* Hệ thống Tab cho tình trạng máu - TÁCH RIÊNG */}
              <Box sx={{ mb: 2.5, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6' }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tabs 
                    value={currentTab} 
                    onChange={handleTabChange} 
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      '& .MuiTab-root': {
                        minHeight: 42,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        py: 0.75,
                      },
                      '& .Mui-selected': {
                        color: '#1976d2',
                      }
                    }}
                  >
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: '#2e7d32',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {availableBloodUnits.availableExact?.length || 0}
                          </Box>
                          Máu cùng nhóm
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: '#1976d2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {availableBloodUnits.availableCompatible?.length || 0}
                          </Box>
                          Máu tương thích
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: '#ff9800',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {availableBloodUnits.reserved?.length || 0}
                          </Box>
                          Máu đã đặt chỗ
                        </Box>
                      } 
                    />
                    <Tab 
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: '50%', 
                            bgcolor: '#d32f2f',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            color: 'white',
                            fontWeight: 'bold'
                          }}>
                            {availableBloodUnits.eligibleDonors?.length || 0}
                          </Box>
                          Người hiến gần đây
                        </Box>
                      } 
                    />
                  </Tabs>
                </Box>
                
                {/* ==========================================
                HIỂN THỊ NỘI DUNG THEO TIÊU CHÍ CHỌN MÁU
                ==========================================
                
                Tab 0: MÁU CÙNG NHÓM (Ưu tiên cao nhất)
                - Hiển thị máu cùng nhóm với bệnh nhân
                - Ví dụ: Bệnh nhân AB+ → Hiển thị máu AB+
                - An toàn nhất, ít rủi ro nhất
                ========================================== */}
                
                {/* Nội dung của từng tab */}
                <Box sx={{ p: 1.5 }}>
                  {currentTab === 0 && (
                    <>
                      {/* Phần chọn máu cùng nhóm để gán */}
                      {availableBloodUnits.availableExact && availableBloodUnits.availableExact.length > 0 ? (
                        <>
                          <Typography variant="body1" sx={{ mb: 1.5, color: '#2e7d32', fontWeight: 'bold', fontSize: '0.9rem' }}>
                            ✅ Chọn máu cùng nhóm để gán
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                            {availableBloodUnits.availableExact.map((unit) => (
                              <Box key={unit.bloodUnitId} sx={{ 
                                border: '2px solid #4caf50', 
                                borderRadius: 1.5, 
                                p: 1.5, 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 1.5, 
                                background: assignVolumes[unit.bloodUnitId] ? '#f1f8e9' : '#f9f9f9',
                                position: 'relative'
                              }}>
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: -10, 
                                  left: 10, 
                                  bgcolor: '#2e7d32', 
                                  color: 'white', 
                                  px: 0.75, 
                                  py: 0.5, 
                                  borderRadius: 0.75, 
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }}>
                                  ƯU TIÊN
                                </Box>
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
                                  sx={{ mt: 0.75 }}
                                />
                                <Box sx={{ flex: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' }, rowGap: 0.5, columnGap: 1.5, fontSize: '0.8rem' }}>
                                  <div><b>ID:</b> {unit.bloodUnitId}</div>
                                  <div><b>Nhóm máu:</b> <span style={{ color: '#2e7d32', fontWeight: 'bold' }}>{unit.bloodTypeName}</span></div>
                                  <div><b>Thành phần:</b> {translateComponentName(unit.componentName)}</div>
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
                                    size="small"
                                    sx={{ width: 110, ml: 1.5, mt: 0.75 }}
                                  />
                                )}
                              </Box>
                            ))}
                          </Box>
                        </>
                      ) : (
                        <Alert severity="info" sx={{ py: 0.75 }}>Không có máu cùng nhóm nào sẵn sàng.</Alert>
                      )}
                    </>
                  )}

                  {/* ==========================================
                  Tab 1: MÁU TƯƠNG THÍCH (Ưu tiên thứ 2)
                  ==========================================
                  
                  Hiển thị máu tương thích theo quy tắc:
                  - AB+ nhận được: AB+, A+, B+, O+
                  - A+ nhận được: A+, O+
                  - B+ nhận được: B+, O+
                  - O+ chỉ nhận được: O+
                  
                  Ví dụ: Bệnh nhân AB+ → Hiển thị A+, B+, O+
                  ========================================== */}
                  
                  {currentTab === 1 && (
                    <>
                      {/* Phần chọn máu tương thích để gán */}
                      {availableBloodUnits.availableCompatible && availableBloodUnits.availableCompatible.length > 0 ? (
                        <>
                          <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                            ✅ Chọn máu tương thích để gán
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {availableBloodUnits.availableCompatible.map((unit) => (
                              <Box key={unit.bloodUnitId} sx={{ 
                                border: '2px solid #2196f3', 
                                borderRadius: 2, 
                                p: 2, 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 2, 
                                background: assignVolumes[unit.bloodUnitId] ? '#e3f2fd' : '#f9f9f9',
                                position: 'relative'
                              }}>
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: -10, 
                                  left: 10, 
                                  bgcolor: '#1976d2', 
                                  color: 'white', 
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: 1, 
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  TƯƠNG THÍCH
                                </Box>
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
                                  <div><b>Nhóm máu:</b> <span style={{ color: '#1976d2', fontWeight: 'bold' }}>{unit.bloodTypeName}</span></div>
                                  <div><b>Thành phần:</b> {translateComponentName(unit.componentName)}</div>
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
                        </>
                      ) : (
                        <Alert severity="info">Không có máu tương thích nào sẵn sàng.</Alert>
                      )}
                    </>
                  )}

                  {currentTab === 2 && (
                    <>
                      {/* Phần chọn máu đã đặt chỗ để gán */}
                      {availableBloodUnits.reserved && availableBloodUnits.reserved.length > 0 ? (
                        <>
                          <Typography variant="h6" sx={{ mb: 2, color: '#ff9800', fontWeight: 'bold' }}>
                            ✅ Chọn máu đã đặt chỗ để gán
                          </Typography>
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {availableBloodUnits.reserved.map((unit) => (
                              <Box key={unit.bloodUnitId} sx={{ 
                                border: '2px solid #ff9800', 
                                borderRadius: 2, 
                                p: 2, 
                                display: 'flex', 
                                alignItems: 'flex-start', 
                                gap: 2, 
                                background: assignVolumes[unit.bloodUnitId] ? '#fff3e0' : '#f9f9f9',
                                position: 'relative'
                              }}>
                                <Box sx={{ 
                                  position: 'absolute', 
                                  top: -10, 
                                  left: 10, 
                                  bgcolor: '#ff9800', 
                                  color: 'white', 
                                  px: 1, 
                                  py: 0.5, 
                                  borderRadius: 1, 
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold'
                                }}>
                                  ĐÃ ĐẶT CHỖ
                                </Box>
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
                                  <div><b>Nhóm máu:</b> <span style={{ color: '#ff9800', fontWeight: 'bold' }}>{unit.bloodTypeName}</span></div>
                                  <div><b>Thành phần:</b> {translateComponentName(unit.componentName)}</div>
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
                        </>
                      ) : (
                        <Alert severity="info">Không có máu đã đặt chỗ nào.</Alert>
                      )}
                    </>
                  )}

                  {currentTab === 3 && (
                    <>
                      <Typography variant="h6" sx={{ mb: 2, color: '#d32f2f', display: 'flex', alignItems: 'center', gap: 1 }}>
                        🚨 Người hiến gần đây ({availableBloodUnits.eligibleDonors?.length || 0})
                      </Typography>
                      {availableBloodUnits.eligibleDonors && availableBloodUnits.eligibleDonors.length > 0 ? (
                        <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                          {availableBloodUnits.eligibleDonors.map((donor, index) => (
                            <Box key={donor.userId || index} sx={{ 
                              border: '1px solid #d32f2f', 
                              borderRadius: 1, 
                              p: 2, 
                              mb: 1,
                              bgcolor: '#ffebee'
                            }}>
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Typography><strong>Tên:</strong> {donor.fullName}</Typography>
                                  <Typography><strong>Nhóm máu:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{donor.bloodTypeName}</span></Typography>
                                  <Typography><strong>SĐT:</strong> {donor.phone || 'N/A'}</Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Typography><strong>Email:</strong> {donor.email || 'N/A'}</Typography>
                                  <Typography><strong>Khoảng cách:</strong> <span style={{ color: '#d32f2f', fontWeight: 'bold' }}>{donor.distanceKm?.toFixed(2)} km</span></Typography>
                                </Grid>
                              </Grid>
                            </Box>
                          ))}
                        </Box>
                      ) : (
                        <Alert severity="info">Không có người hiến máu nào trong bán kính 20km.</Alert>
                      )}
                    </>
                  )}
                </Box>
              </Box>
            </>
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
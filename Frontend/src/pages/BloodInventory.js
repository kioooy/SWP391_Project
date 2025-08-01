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
  const [bloodHistory, setBloodHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // State cho tìm kiếm theo ID hoặc nhóm máu
  const [searchBloodUnitId, setSearchBloodUnitId] = useState('');
  const [filteredInventory, setFilteredInventory] = useState([]);




  // Hardcode tạm danh sách nhóm máu, thành phần máu, member
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
        // Tự động kiểm tra hết hạn trước
        const token = localStorage.getItem('token');
        await axios.patch('/api/BloodUnit/expire-check', {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Sau đó lấy danh sách kho máu
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




  // Thêm hoặc cập nhật đơn vị máu
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
        // Thêm mới: luôn là nhập kho, không có memberId, trạng thái luôn là Available
        const payload = {
          bloodTypeId: formData.bloodTypeId,
          componentId: formData.componentId,
          volume: parseInt(formData.volume, 10),
          bloodStatus: 'Available',
          addDate: dayjs().format('YYYY-MM-DD'), // Tự động sử dụng ngày hiện tại
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




  // Kiểm tra và cập nhật trạng thái hết hạn
  const handleExpireCheck = async () => {
    const token = localStorage.getItem('token');
    try {
      setLoading(true);
      await axios.patch('/api/BloodUnit/expire-check', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Sau khi kiểm tra xong, lấy lại danh sách mới
      await fetchInventory();
      setError(''); // Xóa lỗi cũ nếu có
    } catch (err) {
      console.error("Lỗi khi kiểm tra hết hạn:", err.response?.data || err.message);
      setError(`Kiểm tra hết hạn thất bại! Lỗi: ${err.response?.data?.title || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mở dialog xác nhận xóa
  const handleDeleteClick = (blood) => {
    setBloodToDelete(blood);
    setDeleteDialogOpen(true);
  };

  // Xóa (soft delete)
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

  // Hàm lấy lịch sử đơn vị máu
  const handleViewHistory = async (bloodUnit) => {
    try {
      setLoadingHistory(true);
      setSelectedBloodHistory(bloodUnit);
      setHistoryDialogOpen(true);
      
      console.log('Đang lấy lịch sử cho đơn vị máu ID:', bloodUnit.bloodUnitId);
      console.log('Thông tin đơn vị máu:', bloodUnit);
      
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      console.log('Headers:', headers);
      
      const response = await axios.get(`/api/BloodUnit/${bloodUnit.bloodUnitId}/history`, { headers });
      console.log('Response từ API history:', response);
      console.log('Response.data:', response.data);
      console.log('Response.data type:', typeof response.data);
      console.log('Response.data is array:', Array.isArray(response.data));
      console.log('Response.data length:', response.data?.length);
      console.log('Response.data keys:', response.data ? Object.keys(response.data) : 'null/undefined');
      
      // Lưu response thô để debug
      
      // Thử nghiệm: Kiểm tra xem có thể lấy lịch sử từ endpoint khác không
      try {
        console.log('Thử nghiệm: Kiểm tra endpoint khác...');
        const testResponse = await axios.get(`/api/TransfusionRequest`, { headers });
        console.log('Test response từ TransfusionRequest:', testResponse.data);
        
        // Tìm kiếm trong danh sách transfusion request
        if (testResponse.data && Array.isArray(testResponse.data)) {
          const relatedRequests = testResponse.data.filter(req => 
            req.bloodUnitId === bloodUnit.bloodUnitId || 
            req.assignedBloodUnits?.some(unit => unit.bloodUnitId === bloodUnit.bloodUnitId)
          );
          console.log('Tìm thấy related requests:', relatedRequests);
        }
      } catch (testError) {
        console.log('Không thể test endpoint khác:', testError.message);
      }
      
      // Kiểm tra và xử lý dữ liệu response
      let historyData = [];
      if (response.data) {
        // Nếu response.data là array
        if (Array.isArray(response.data)) {
          historyData = response.data;
          console.log('Sử dụng response.data trực tiếp (array)');
        }
        // Nếu response.data là object có chứa array
        else if (typeof response.data === 'object') {
          console.log('Response.data là object, kiểm tra các key:', Object.keys(response.data));
          
          // Xử lý format mới: { donationRequest: [], transfusionRequest: [], urgentBloodRequest: [] }
          const allRequests = [];
          
          if (response.data.transfusionRequest && Array.isArray(response.data.transfusionRequest)) {
            const transfusionRequests = response.data.transfusionRequest.map(item => ({
              ...item,
              requestType: 'TransfusionRequest'
            }));
            allRequests.push(...transfusionRequests);
            console.log('Tìm thấy dữ liệu trong transfusionRequest:', transfusionRequests);
          }
          
          if (response.data.donationRequest && Array.isArray(response.data.donationRequest)) {
            const donationRequests = response.data.donationRequest.map(item => ({
              ...item,
              requestType: 'DonationRequest'
            }));
            allRequests.push(...donationRequests);
            console.log('Tìm thấy dữ liệu trong donationRequest:', donationRequests);
          }
          
          if (response.data.urgentBloodRequest && Array.isArray(response.data.urgentBloodRequest)) {
            const urgentRequests = response.data.urgentBloodRequest.map(item => ({
              ...item,
              requestType: 'UrgentBloodRequest'
            }));
            allRequests.push(...urgentRequests);
            console.log('Tìm thấy dữ liệu trong urgentBloodRequest:', urgentRequests);
          }
          
          if (allRequests.length > 0) {
            historyData = allRequests;
            console.log('Tổng hợp tất cả requests:', historyData);
          } else {
            // Kiểm tra các key có thể chứa dữ liệu lịch sử khác
            const possibleKeys = ['transfusionHistory', 'usageHistory', 'history', 'data', 'items', 'results'];
            for (const key of possibleKeys) {
              if (response.data[key] && Array.isArray(response.data[key])) {
                historyData = response.data[key];
                console.log(`Tìm thấy dữ liệu trong key: ${key}`);
                break;
              }
            }
          }
          
          // Nếu không tìm thấy key nào, thử sử dụng response.data trực tiếp
          if (historyData.length === 0) {
            console.log('Không tìm thấy array trong các key, kiểm tra response.data có length không');
            if (response.data.length > 0) {
              historyData = response.data;
              console.log('Sử dụng response.data trực tiếp (có length)');
            }
          }
        }
      }
      
      console.log('Dữ liệu lịch sử đã xử lý:', historyData);
      console.log('Số lượng bản ghi:', historyData.length);
      console.log('historyData type:', typeof historyData);
      console.log('historyData is array:', Array.isArray(historyData));
      
      // Nếu historyData không phải array, thử chuyển đổi
      if (!Array.isArray(historyData) && historyData) {
        console.log('historyData không phải array, thử chuyển đổi...');
        if (typeof historyData === 'object') {
          historyData = [historyData];
          console.log('Đã chuyển object thành array:', historyData);
        }
      }
      
      setBloodHistory(historyData || []);
      
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử đơn vị máu:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      // Hiển thị thông báo lỗi cụ thể
      if (error.response?.status === 401) {
        setError('Bạn cần đăng nhập để xem lịch sử đơn vị máu.');
      } else if (error.response?.status === 404) {
        setError('Không tìm thấy lịch sử cho đơn vị máu này.');
      } else if (error.response?.status === 500) {
        setError('Lỗi server khi lấy lịch sử. Vui lòng thử lại sau.');
      } else {
        setError(`Không thể kết nối để lấy lịch sử. Lỗi: ${error.message}`);
      }
      
      setBloodHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Hàm đóng dialog lịch sử
  const handleCloseHistoryDialog = () => {
    setHistoryDialogOpen(false);
    setSelectedBloodHistory(null);
    setBloodHistory([]);
  };

  // Hàm cập nhật trạng thái đơn vị máu dựa trên remainingVolume
  const getUpdatedStatus = (status, remainingVolume) => {
    if (remainingVolume === 0) {
      return 'used'; // Đánh dấu là đã sử dụng
    }
    return status || 'available';
  };




  // Thống kê tổng số lượng máu theo nhóm
  const totalByType = bloodTypes.reduce((acc, type) => {
    const total = inventory.filter((item) => item.bloodTypeName === type.name && item.bloodStatus === 'Available')
      .reduce((sum, item) => sum + (item.remainingVolume || 0), 0);
    acc[type.name] = total;
    return acc;
  }, {});




  const getStatusChip = (status, remainingVolume) => {
    // Debug: Log thông tin để kiểm tra
    console.log('getStatusChip - status:', status, 'remainingVolume:', remainingVolume);
    
    // Kiểm tra nếu hết máu (remainingVolume = 0) - ưu tiên cao nhất
    if (remainingVolume === 0) {
      console.log('remainingVolume = 0, hiển thị "Đã sử dụng"');
      return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng" color="info" size="small" />;
    }
    
    // Kiểm tra nếu còn ít máu (remainingVolume < volume ban đầu)
    if (remainingVolume > 0 && remainingVolume < 100) { // Giả sử volume ban đầu là 100ml
      console.log('remainingVolume < 100, hiển thị "Đã sử dụng một phần"');
      return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng một phần" color="warning" size="small" />;
    }
    
    // Nếu còn đủ máu, kiểm tra bloodStatus
    switch (status?.toLowerCase()) {
      case 'available':
        console.log('status = available, hiển thị "Có sẵn"');
        return <Chip icon={<CheckCircleIcon />} label="Có sẵn" color="success" size="small" />;
      case 'reserved':
        console.log('status = reserved, hiển thị "Đã đặt"');
        return <Chip icon={<WarningIcon />} label="Đã đặt" color="warning" size="small" />;
      case 'expired':
        console.log('status = expired, hiển thị "Hết hạn"');
        return <Chip icon={<WarningIcon />} label="Hết hạn" color="error" size="small" />;
      case 'used':
        console.log('status = used, hiển thị "Đã sử dụng"');
        return <Chip icon={<LocalHospitalIcon />} label="Đã sử dụng" color="info" size="small" />;
      case 'discarded':
        console.log('status = discarded, hiển thị "Đã loại bỏ"');
        return <Chip icon={<WarningIcon />} label="Đã loại bỏ" color="error" size="small" />;
      default:
        console.log('status không rõ:', status, 'nhưng remainingVolume > 0, hiển thị "Có sẵn"');
        // Nếu remainingVolume > 0 nhưng status không rõ, coi như có sẵn
        return <Chip icon={<CheckCircleIcon />} label="Có sẵn" color="success" size="small" />;
    }
  };


  const getStatusText = (status, remainingVolume) => {
    // Kiểm tra nếu hết máu (remainingVolume = 0) - ưu tiên cao nhất
    if (remainingVolume === 0) {
      return 'Đã sử dụng';
    }
    
    // Kiểm tra nếu còn ít máu (remainingVolume < volume ban đầu)
    if (remainingVolume > 0 && remainingVolume < 100) { // Giả sử volume ban đầu là 100ml
      return 'Đã sử dụng một phần';
    }
    
    // Nếu còn đủ máu, kiểm tra bloodStatus
    switch (status?.toLowerCase()) {
      case 'available':
        return 'Có sẵn';
      case 'reserved':
        return 'Đã đặt';
      case 'expired':
        return 'Hết hạn';
      case 'used': // Thêm trạng thái này nếu có thể xuất hiện trong dữ liệu
        return 'Đã sử dụng';
      case 'discarded': // Thêm trạng thái này nếu có thể xuất hiện trong dữ liệu
        return 'Đã loại bỏ';
      default:
        // Nếu remainingVolume > 0 nhưng status không rõ, coi như có sẵn
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
        {/* Bảng quản lý kho máu */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Typography variant="h6">Danh sách đơn vị máu</Typography>
                <TextField
                  label="Tìm kiếm nhóm máu"
                  variant="outlined"
                  size="small"
                  value={searchBloodUnitId}
                  onChange={(e) => setSearchBloodUnitId(e.target.value)}
                  placeholder="Nhập ID hoặc tên nhóm máu"
                  sx={{ minWidth: 250 }}
                />
              </Box>
              {(isAdmin || isStaff) && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Thêm đơn vị máu
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
                    <TableCell>Ngày nhập</TableCell>
                    <TableCell>Ngày hết hạn</TableCell>
                    <TableCell>Thể tích (ml)</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    {isAdmin && <TableCell>Thao tác</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inventory
                    .filter(row => 
                      !searchBloodUnitId || 
                      row.bloodUnitId.toString().includes(searchBloodUnitId) ||
                      row.bloodTypeName.toLowerCase().includes(searchBloodUnitId.toLowerCase())
                    )
                    .sort((a, b) => new Date(b.addDate) - new Date(a.addDate)) // Sắp xếp theo ngày nhập giảm dần (mới nhất lên đầu)
                    .map((row) => (






                    <TableRow 
                      key={row.bloodUnitId}
                      style={
                        row.remainingVolume === 0
                          ? { opacity: 0.5, background: '#f5f5f5' }
                          : {}
                      }
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
                    // Nếu nhập số âm hoặc không phải số, chuyển về 0
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
                    // Nếu nhập số âm hoặc không phải số, chuyển về 0
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
              <Typography><strong>Trạng thái:</strong>  {getStatusText(getUpdatedStatus(viewDetail?.bloodStatus, viewDetail?.remainingVolume), viewDetail?.remainingVolume)}</Typography>
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

      {/* Dialog xác nhận xóa */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
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

      {/* Dialog hiển thị lịch sử đơn vị máu */}
      <Dialog 
        open={historyDialogOpen} 
        onClose={handleCloseHistoryDialog} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle sx={{ color: '#e53e3e', fontWeight: 'bold' }}>
          Lịch sử sử dụng đơn vị máu - ID: {selectedBloodHistory?.bloodUnitId}
        </DialogTitle>
        <DialogContent dividers>
          {loadingHistory ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LinearProgress />
            </Box>
          ) : bloodHistory.length === 0 ? (
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
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID yêu cầu truyền máu</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Thành phần</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Thể tích sử dụng (ml)</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ngày sử dụng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodHistory.map((history, index) => (
                      <TableRow key={index}>
                        <TableCell>{history.transfusionId || 'N/A'}</TableCell>
                        <TableCell>
                          {history.componentName === 'Plasma' ? 'Huyết tương' :
                           history.componentName === 'Red Blood Cells' ? 'Hồng cầu' :
                           history.componentName === 'Platelets' ? 'Tiểu cầu' :
                           history.componentName === 'Whole Blood' ? 'Máu toàn phần' :
                           history.componentName || 'N/A'}
                        </TableCell>
                        <TableCell>{history.assignedVolume || 0}</TableCell>
                        <TableCell>
                          {history.assignedDate ? new Date(history.assignedDate).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          }) : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
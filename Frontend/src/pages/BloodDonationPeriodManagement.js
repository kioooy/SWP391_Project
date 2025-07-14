import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Button,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  Grid,
  Tooltip
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import axios from 'axios';
import CreateBloodDonationPeriod from '../components/CreateBloodDonationPeriod';

const BloodDonationPeriodManagement = () => {
  const currentUser = useSelector(state => state.auth.user);
  const isAdmin = currentUser?.role === 'Admin';
  const isStaff = currentUser?.role === 'Staff';
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [editedData, setEditedData] = useState({
    periodName: '',
    periodDateFrom: null,
    periodDateTo: null,
    targetQuantity: 0,
    location: ''
  });

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const route = (isAdmin || isStaff)
        ? '/api/BloodDonationPeriod/all/admin,staff'
        : '/api/BloodDonationPeriod';
      const response = await axios.get(route, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPeriods(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError('Không thể lấy dữ liệu đợt hiến máu!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleStatusChange = async (periodId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`/api/BloodDonationPeriod/${periodId}/status/admin`, JSON.stringify(newStatus), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      setPeriods(periods.map(p =>
        p.periodId === periodId ? { ...p, status: newStatus } : p
      ));
      alert('Cập nhật trạng thái thành công!');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Cập nhật trạng thái thất bại!');
    }
  };

  const handleEdit = (period) => {
    setEditingPeriod(period);
    setEditedData({
      periodName: period.periodName,
      periodDateFrom: dayjs(period.periodDateFrom),
      periodDateTo: dayjs(period.periodDateTo),
      targetQuantity: period.targetQuantity,
      location: period.location
    });
    setEditDialogOpen(true);
  };
  
  const handleUpdate = async () => {
    if (!editingPeriod) return;

    try {
      const token = localStorage.getItem('token');
      const requestData = {
        periodName: editedData.periodName,
        periodDateFrom: editedData.periodDateFrom.toISOString(),
        periodDateTo: editedData.periodDateTo.toISOString(),
        targetQuantity: parseInt(editedData.targetQuantity, 10),
        imageUrl: editingPeriod.imageUrl,
        location: editedData.location
      };

      await axios.patch(`/api/BloodDonationPeriod/${editingPeriod.periodId}/details/admin,staff`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      const updatedPeriod = {
        ...editingPeriod,
        periodName: editedData.periodName,
        location: editedData.location,
        periodDateFrom: editedData.periodDateFrom.toISOString(),
        periodDateTo: editedData.periodDateTo.toISOString(),
        targetQuantity: parseInt(editedData.targetQuantity, 10),
      };

      setPeriods(periods.map(p => (p.periodId === editingPeriod.periodId ? updatedPeriod : p)));
      setEditDialogOpen(false);
      setEditingPeriod(null);
      alert('Cập nhật đợt hiến máu thành công!');
    } catch (error) {
      console.error('Error updating period:', error.response?.data || error.message);
      alert(`Cập nhật đợt hiến máu thất bại! Lỗi: ${error.response?.data?.title || error.message}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedPeriod) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/BloodDonationPeriod/${selectedPeriod.periodId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPeriods(periods.filter(p => p.periodId !== selectedPeriod.periodId));
      setDeleteDialogOpen(false);
      setSelectedPeriod(null);
      alert('Xóa đợt hiến máu thành công!');
    } catch (error) {
      console.error('Error deleting period:', error);
      alert('Xóa đợt hiến máu thất bại!');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Completed':
        return 'primary';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Active':
        return 'Hoạt động';
      case 'Completed':
        return 'Hoàn thành';
      case 'Cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const filteredPeriods = periods.filter(period => {
    if (statusFilter === 'all') {
      return true;
    }
    return period.status === statusFilter;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Quản Lý Đợt Hiến Máu
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Tạo Đợt Hiến Máu Mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <FormControl sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id="status-filter-label">Lọc theo trạng thái</InputLabel>
        <Select
          labelId="status-filter-label"
          id="status-filter"
          value={statusFilter}
          label="Lọc theo trạng thái"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="Active">Hoạt động</MenuItem>
          <MenuItem value="Completed">Hoàn thành</MenuItem>
          <MenuItem value="Cancelled">Đã hủy</MenuItem>
        </Select>
      </FormControl>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên đợt</TableCell>
                {/* <TableCell>Địa điểm</TableCell> */}
                <TableCell>Thời gian bắt đầu</TableCell>
                <TableCell>Thời gian kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Số lượng mục tiêu</TableCell>
                <TableCell>Số lượng hiện tại</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPeriods.map((period) => (
                <TableRow key={period.periodId} hover>
                  <TableCell>{period.periodId}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {period.periodName}
                    </Typography>
                  </TableCell>
                  <TableCell>{period.location}</TableCell>
                  <TableCell>{formatDate(period.periodDateFrom)}</TableCell>
                  <TableCell>{formatDate(period.periodDateTo)}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <Select
                        value={period.status}
                        onChange={(e) => handleStatusChange(period.periodId, e.target.value)}
                        displayEmpty
                      >
                        <MenuItem value="Active">Hoạt động</MenuItem>
                        <MenuItem value="Completed">Hoàn thành</MenuItem>
                        <MenuItem value="Cancelled">Đã hủy</MenuItem>
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>{period.targetQuantity}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${period.currentQuantity || 0}/${period.targetQuantity}`}
                      color={period.currentQuantity >= period.targetQuantity ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {(isAdmin || isStaff) && (
                      <Box>
                        <Tooltip title="Chỉnh sửa đợt hiến máu">
                          <IconButton onClick={() => handleEdit(period)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa đợt hiến máu">
                          <IconButton
                            onClick={() => {
                              setSelectedPeriod(period);
                              setDeleteDialogOpen(true);
                            }}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create Dialog */}
      <CreateBloodDonationPeriod
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={fetchPeriods}
      />

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Chỉnh Sửa Đợt Hiến Máu</DialogTitle>
        <DialogContent>
          {editingPeriod && (
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Tên đợt hiến máu"
                    value={editedData.periodName}
                    onChange={(e) => setEditedData({ ...editedData, periodName: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Địa điểm"
                    value={editedData.location}
                    onChange={(e) => setEditedData({ ...editedData, location: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Thời gian bắt đầu"
                    value={editedData.periodDateFrom}
                    onChange={(newValue) => setEditedData({ ...editedData, periodDateFrom: newValue })}
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        fullWidth 
                        helperText={editingPeriod && dayjs().isAfter(dayjs(editingPeriod.periodDateFrom)) ? "Không thể sửa ngày bắt đầu của đợt đã diễn ra." : ""}
                      />
                    )}
                    disabled={editingPeriod && dayjs().isAfter(dayjs(editingPeriod.periodDateFrom))}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="Thời gian kết thúc"
                    value={editedData.periodDateTo}
                    onChange={(newValue) => setEditedData({ ...editedData, periodDateTo: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Số lượng mục tiêu"
                    type="number"
                    value={editedData.targetQuantity}
                    onChange={(e) => setEditedData({ ...editedData, targetQuantity: e.target.value })}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleUpdate} variant="contained">Lưu</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn xóa đợt hiến máu "{selectedPeriod?.periodName}" không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BloodDonationPeriodManagement; 
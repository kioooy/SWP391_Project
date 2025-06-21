import React, { useEffect, useState } from 'react';
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
  MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import CreateBloodDonationPeriod from '../components/CreateBloodDonationPeriod';

const BloodDonationPeriodManagement = () => {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(null);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/BloodDonationPeriod/all', {
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
      await axios.patch(`/api/BloodDonationPeriod/${periodId}/status`, JSON.stringify(newStatus), {
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

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên đợt</TableCell>
                <TableCell>Địa điểm</TableCell>
                <TableCell>Thời gian bắt đầu</TableCell>
                <TableCell>Thời gian kết thúc</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Số lượng mục tiêu</TableCell>
                <TableCell>Số lượng hiện tại</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {periods.map((period) => (
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
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        // TODO: Implement edit functionality
                        alert('Chức năng chỉnh sửa sẽ được phát triển sau');
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedPeriod(period);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
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
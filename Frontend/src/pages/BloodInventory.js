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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const BloodInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [formData, setFormData] = useState({
    bloodTypeId: '',
    componentId: '',
    memberId: '',
    volume: '',
    bloodStatus: 'Available',
  });

  // Hardcode tạm danh sách nhóm máu, thành phần máu, member
  const bloodTypes = [
    { id: 1, name: 'A+' }, { id: 2, name: 'A-' }, { id: 3, name: 'B+' }, { id: 4, name: 'B-' },
    { id: 5, name: 'AB+' }, { id: 6, name: 'AB-' }, { id: 7, name: 'O+' }, { id: 8, name: 'O-' }
  ];
  const components = [
    { id: 1, name: 'Whole Blood' },
    { id: 2, name: 'Red Blood Cells' },
    { id: 3, name: 'Plasma' },
    { id: 4, name: 'Platelets' }
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
      setError('Không thể tải dữ liệu kho máu!');
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
        bloodTypeId: blood.BloodTypeId || bloodTypes.find(t => t.name === blood.BloodTypeName)?.id || '',
        componentId: blood.ComponentId || components.find(c => c.name === blood.ComponentName)?.id || '',
        memberId: blood.MemberId || members.find(m => m.name === blood.FullName)?.id || '',
        volume: blood.Volume || blood.RemainingVolume || '',
        bloodStatus: blood.BloodStatus || 'Available',
      });
    } else {
      setSelectedBlood(null);
      setFormData({
        bloodTypeId: '',
        componentId: '',
        memberId: '',
        volume: '',
        bloodStatus: 'Available',
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
    try {
      if (selectedBlood) {
        // Update
        await axios.patch(`/api/BloodUnit/${selectedBlood.BloodUnitId}`, {
          BloodTypeId: formData.bloodTypeId,
          ComponentId: formData.componentId,
          MemberId: formData.memberId,
          Volume: formData.volume,
          BloodStatus: formData.bloodStatus,
          remainingVolume: formData.volume,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Add
        await axios.post('/api/BloodUnit', {
          BloodTypeId: formData.bloodTypeId,
          ComponentId: formData.componentId,
          MemberId: formData.memberId,
          Volume: formData.volume,
          BloodStatus: formData.bloodStatus,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchInventory();
      handleCloseDialog();
    } catch (err) {
      setError('Lưu dữ liệu thất bại!');
    }
  };

  // Xóa (soft delete)
  const handleDelete = async (blood) => {
    const token = localStorage.getItem('token');
    try {
      await axios.patch(`/api/BloodUnit/${blood.BloodUnitId}/discard`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchInventory();
    } catch (err) {
      setError('Xóa thất bại!');
    }
  };

  // Thống kê tổng số lượng máu theo nhóm
  const totalByType = bloodTypes.reduce((acc, type) => {
    const total = inventory.filter((item) => item.BloodTypeName === type.name && item.BloodStatus === 'Available')
      .reduce((sum, item) => sum + (item.RemainingVolume || 0), 0);
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
      {/* Thống kê tổng quan */}
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Danh sách đơn vị máu</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Thêm đơn vị máu
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhóm máu</TableCell>
                  <TableCell>Thành phần</TableCell>
                  <TableCell>Thể tích (ml)</TableCell>
                  <TableCell>Ngày thêm</TableCell>
                  <TableCell>Ngày hết hạn</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Người hiến</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {inventory.map((row) => (
                  <TableRow key={row.BloodUnitId}>
                    <TableCell>{row.BloodTypeName}</TableCell>
                    <TableCell>{row.ComponentName}</TableCell>
                    <TableCell>{row.Volume}</TableCell>
                    <TableCell>{row.AddDate}</TableCell>
                    <TableCell>{row.ExpiryDate}</TableCell>
                    <TableCell>{getStatusChip(row.BloodStatus)}</TableCell>
                    <TableCell>{row.FullName}</TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(row)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
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
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nhóm máu</InputLabel>
                <Select
                  value={formData.bloodTypeId}
                  label="Nhóm máu"
                  onChange={(e) => setFormData({ ...formData, bloodTypeId: e.target.value })}
                >
                  {bloodTypes.map((type) => (
                    <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thành phần</InputLabel>
                <Select
                  value={formData.componentId}
                  label="Thành phần"
                  onChange={(e) => setFormData({ ...formData, componentId: e.target.value })}
                >
                  {components.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Người hiến</InputLabel>
                <Select
                  value={formData.memberId}
                  label="Người hiến"
                  onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                >
                  {members.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Thể tích (ml)"
                type="number"
                value={formData.volume}
                onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Ngày hết hạn"
                type="date"
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData({ ...formData, expiryDate: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Trạng thái</InputLabel>
                <Select
                  value={formData.status}
                  label="Trạng thái"
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <MenuItem value="available">Có sẵn</MenuItem>
                  <MenuItem value="reserved">Đã đặt</MenuItem>
                  <MenuItem value="expired">Hết hạn</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nguồn</InputLabel>
                <Select
                  value={formData.source}
                  label="Nguồn"
                  onChange={(e) =>
                    setFormData({ ...formData, source: e.target.value })
                  }
                >
                  <MenuItem value="donation">Hiến máu</MenuItem>
                  <MenuItem value="transfer">Chuyển kho</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Ghi chú"
                multiline
                rows={3}
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedBlood ? 'Cập nhật' : 'Thêm mới'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BloodInventory; 
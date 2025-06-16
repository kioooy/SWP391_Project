import React, { useState } from 'react';
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
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlood, setSelectedBlood] = useState(null);
  const [formData, setFormData] = useState({
    bloodType: '',
    quantity: '',
    expiryDate: '',
    status: 'available', // 'available', 'reserved', 'expired'
    source: '', // 'donation', 'transfer'
    notes: '',
  });

  // Dữ liệu mẫu
  const mockInventory = [
    {
      id: 1,
      bloodType: 'A+',
      quantity: 15,
      expiryDate: '2024-04-15',
      status: 'available',
      source: 'donation',
      lastUpdated: '2024-03-15',
    },
    {
      id: 2,
      bloodType: 'B+',
      quantity: 8,
      expiryDate: '2024-04-10',
      status: 'reserved',
      source: 'transfer',
      lastUpdated: '2024-03-14',
    },
    {
      id: 3,
      bloodType: 'O-',
      quantity: 5,
      expiryDate: '2024-03-20',
      status: 'expired',
      source: 'donation',
      lastUpdated: '2024-03-13',
    },
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  // Tính toán tổng số lượng máu theo nhóm
  const totalByType = bloodTypes.reduce((acc, type) => {
    const total = mockInventory
      .filter((item) => item.bloodType === type && item.status === 'available')
      .reduce((sum, item) => sum + item.quantity, 0);
    acc[type] = total;
    return acc;
  }, {});

  const handleOpenDialog = (blood = null) => {
    if (blood) {
      setSelectedBlood(blood);
      setFormData({
        bloodType: blood.bloodType,
        quantity: blood.quantity,
        expiryDate: blood.expiryDate,
        status: blood.status,
        source: blood.source,
        notes: '',
      });
    } else {
      setSelectedBlood(null);
      setFormData({
        bloodType: '',
        quantity: '',
        expiryDate: '',
        status: 'available',
        source: 'donation',
        notes: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBlood(null);
  };

  const handleSubmit = () => {
    // Xử lý thêm/cập nhật đơn vị máu
    console.log('Form submitted:', formData);
    handleCloseDialog();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'available':
        return (
          <Chip
            icon={<CheckCircleIcon />}
            label="Có sẵn"
            color="success"
            size="small"
          />
        );
      case 'reserved':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Đã đặt"
            color="warning"
            size="small"
          />
        );
      case 'expired':
        return (
          <Chip
            icon={<WarningIcon />}
            label="Hết hạn"
            color="error"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Quản lý kho máu
      </Typography>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {bloodTypes.map((type) => (
          <Grid item xs={12} sm={6} md={3} key={type}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nhóm máu {type}
                </Typography>
                <Typography variant="h4" color="primary" gutterBottom>
                  {totalByType[type] || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  đơn vị máu có sẵn
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(totalByType[type] || 0) * 10}
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
                  <TableCell>Số lượng</TableCell>
                  <TableCell>Ngày hết hạn</TableCell>
                  <TableCell>Trạng thái</TableCell>
                  <TableCell>Nguồn</TableCell>
                  <TableCell>Cập nhật lần cuối</TableCell>
                  <TableCell>Thao tác</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mockInventory.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Chip
                        label={row.bloodType}
                        color="error"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.expiryDate}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                    <TableCell>
                      {row.source === 'donation' ? 'Hiến máu' : 'Chuyển kho'}
                    </TableCell>
                    <TableCell>{row.lastUpdated}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(row)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" color="error">
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
                  value={formData.bloodType}
                  label="Nhóm máu"
                  onChange={(e) =>
                    setFormData({ ...formData, bloodType: e.target.value })
                  }
                >
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Số lượng"
                type="number"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: e.target.value })
                }
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
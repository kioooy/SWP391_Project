import React, { useState } from 'react';
import {
  Container, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, TextField, FormControl, InputLabel, Select, MenuItem, Grid, Card, CardContent, Alert, Button
} from '@mui/material';
import { Search as SearchIcon, FilterList as FilterIcon } from '@mui/icons-material';
import axios from 'axios';

// Dữ liệu ảo cho lịch sử truyền máu
const mockTransfusionHistory = [
  {
    id: 1,
    date: '2024-01-15',
    bloodType: 'A+',
    component: 'Truyền toàn phần',
    volume: 450,
    status: 'Hoàn thành',
    hospital: 'Bệnh viện Chợ Rẫy',
    notes: 'Truyền máu thành công, bệnh nhân hồi phục tốt',
    doctor: 'BS. Nguyễn Văn A'
  },
  {
    id: 2,
    date: '2024-01-10',
    bloodType: 'O+',
    component: 'Hồng cầu',
    volume: 300,
    status: 'Hoàn thành',
    hospital: 'Bệnh viện 115',
    notes: 'Truyền hồng cầu cho bệnh nhân thiếu máu',
    doctor: 'BS. Trần Thị B'
  },
  {
    id: 3,
    date: '2024-01-08',
    bloodType: 'B+',
    component: 'Huyết tương',
    volume: 200,
    status: 'Đang xử lý',
    hospital: 'Bệnh viện Đại học Y Dược',
    notes: 'Đang chuẩn bị truyền huyết tương',
    doctor: 'BS. Lê Văn C'
  },
  {
    id: 4,
    date: '2024-01-05',
    bloodType: 'AB+',
    component: 'Tiểu cầu',
    volume: 150,
    status: 'Đã hủy',
    hospital: 'Bệnh viện Nhi Đồng 1',
    notes: 'Bệnh nhân từ chối truyền máu',
    doctor: 'BS. Phạm Thị D'
  },
  {
    id: 5,
    date: '2024-01-03',
    bloodType: 'A-',
    component: 'Truyền toàn phần',
    volume: 400,
    status: 'Hoàn thành',
    hospital: 'Bệnh viện Nhân Dân 115',
    notes: 'Truyền máu khẩn cấp cho bệnh nhân tai nạn',
    doctor: 'BS. Hoàng Văn E'
  },
  {
    id: 6,
    date: '2024-01-01',
    bloodType: 'O-',
    component: 'Hồng cầu',
    volume: 250,
    status: 'Hoàn thành',
    hospital: 'Bệnh viện Thống Nhất',
    notes: 'Truyền máu cho bệnh nhân phẫu thuật',
    doctor: 'BS. Võ Thị F'
  }
];

const TransfusionHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [filteredData, setFilteredData] = useState(mockTransfusionHistory);
  const [cancelSuccess, setCancelSuccess] = useState('');
  const [cancelError, setCancelError] = useState('');

  // Filter dữ liệu
  const handleFilter = () => {
    let filtered = mockTransfusionHistory;

    // Filter theo trạng thái
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Filter theo từ khóa tìm kiếm
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.bloodType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.component.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.doctor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredData(filtered);
  };

  // Xử lý khi thay đổi filter
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setTimeout(handleFilter, 100);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setTimeout(handleFilter, 100);
  };

  // Thống kê
  const getStatistics = () => {
    const total = mockTransfusionHistory.length;
    const completed = mockTransfusionHistory.filter(item => item.status === 'Hoàn thành').length;
    const processing = mockTransfusionHistory.filter(item => item.status === 'Đang xử lý').length;
    const cancelled = mockTransfusionHistory.filter(item => item.status === 'Đã hủy').length;

    return { total, completed, processing, cancelled };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoàn thành':
        return 'success';
      case 'Đang xử lý':
        return 'warning';
      case 'Đã hủy':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const stats = getStatistics();

  const handleCancel = async (id) => {
    setCancelError('');
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      await axios.patch(`${API_URL}/TransfusionRequest/${id}/cancel`);
      setCancelSuccess('Hủy yêu cầu thành công!');
      // Cập nhật lại dữ liệu lịch sử (nên fetch lại từ API thực tế)
    } catch (err) {
      setCancelError('Hủy yêu cầu thất bại!');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Lịch sử truyền máu
      </Typography>

      {/* Thống kê */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Tổng số
              </Typography>
              <Typography variant="h4" color="primary">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Hoàn thành
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.completed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Đang xử lý
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.processing}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="text.secondary">
                Đã hủy
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.cancelled}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bộ lọc */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          <FilterIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Bộ lọc
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Tìm kiếm"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tìm theo nhóm máu, thành phần, bệnh viện..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={statusFilter}
                label="Trạng thái"
                onChange={handleStatusFilterChange}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="Hoàn thành">Hoàn thành</MenuItem>
                <MenuItem value="Đang xử lý">Đang xử lý</MenuItem>
                <MenuItem value="Đã hủy">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Bảng lịch sử */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Ngày truyền</TableCell>
                <TableCell>Nhóm máu</TableCell>
                <TableCell>Thành phần</TableCell>
                <TableCell>Số lượng (ml)</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Bệnh viện</TableCell>
                <TableCell>Bác sĩ</TableCell>
                <TableCell>Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>{formatDate(row.date)}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.bloodType}
                      color="error"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{row.component}</TableCell>
                  <TableCell>{row.volume}</TableCell>
                  <TableCell>
                    <Chip
                      label={row.status}
                      color={getStatusColor(row.status)}
                      size="small"
                    />
                    {row.status === 'Pending' && (
                      <Button size="small" color="error" onClick={() => handleCancel(row.id)} sx={{ ml: 1 }}>
                        Hủy yêu cầu
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>{row.hospital}</TableCell>
                  <TableCell>{row.doctor}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200 }}>
                      {row.notes}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {filteredData.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Không tìm thấy dữ liệu phù hợp với bộ lọc.
        </Alert>
      )}

      {cancelSuccess && <Alert severity="success">{cancelSuccess}</Alert>}
      {cancelError && <Alert severity="error">{cancelError}</Alert>}
    </Container>
  );
};

export default TransfusionHistory; 
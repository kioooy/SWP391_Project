import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Card, CardContent, Avatar, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, Grid, CircularProgress, Alert, TextField
} from '@mui/material';
import { Bloodtype, CalendarToday, LocalHospital } from '@mui/icons-material';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

const getStatusColor = (status) => {
  switch (status) {
    case 'Completed':
    case 'Hoàn thành':
      return 'success';
    case 'Approved':
    case 'Đang xử lý':
      return 'warning';
    case 'Cancelled':
    case 'Đã hủy':
      return 'error';
    default:
      return 'default';
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('vi-VN');
};

const TransfusionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

  // Bổ sung state cho tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/TransfusionRequest/my-history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setHistory(data);
        setFilteredHistory(data); // Mặc định hiển thị tất cả
      } catch (err) {
        setError(err.message || 'Lỗi khi tải lịch sử truyền máu');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  // Lọc dữ liệu khi searchTerm thay đổi
  useEffect(() => {
    if (!searchTerm) {
      setFilteredHistory(history);
    } else {
      const lowerTerm = searchTerm.toLowerCase();
      const filtered = history.filter(item =>
        (item.bloodType_BloodTypeName || item.bloodTypeName || '').toLowerCase().includes(lowerTerm) ||
        (item.component_ComponentName || item.componentName || '').toLowerCase().includes(lowerTerm)
      );
      setFilteredHistory(filtered);
    }
  }, [searchTerm, history]);

  const handleDetail = (item) => {
    setSelected(item);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Lịch sử truyền máu
      </Typography>

      {/* Input tìm kiếm */}
      <TextField
        label="Tìm theo nhóm máu hoặc thành phần"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
      ) : filteredHistory.length === 0 ? (
        <Alert severity="info" sx={{ my: 4 }}>Không tìm thấy kết quả phù hợp.</Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredHistory.map((item) => (
            <Grid item xs={12} key={item.transfusionId}>
              <Card sx={{ mb: 2, boxShadow: 2, borderRadius: 2, background: '#f8f9fa' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ width: 60, height: 60, bgcolor: 'error.main', mr: 2 }}>
                    <Bloodtype fontSize="large" />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{item.hospital || '---'}</Typography>
                    <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                      <CalendarToday sx={{ fontSize: 18, mr: 1 }} />
                      {formatDate(item.requestDate)}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                      <Bloodtype sx={{ fontSize: 18, mr: 1 }} />
                      {item.bloodType_BloodTypeName || item.bloodTypeName} - {item.component_ComponentName || item.componentName}
                    </Typography>
                    <Typography color="text.secondary" sx={{ mb: 0.5 }}>
                      <LocalHospital sx={{ fontSize: 18, mr: 1 }} />
                      {item.transfusionVolume} ml
                    </Typography>
                    <Chip label={item.status} color={getStatusColor(item.status)} sx={{ fontWeight: 'bold', borderRadius: 2 }} />
                  </Box>
                  <Button onClick={() => handleDetail(item)} sx={{ ml: 2 }}>Chi tiết</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
        <DialogTitle>Chi tiết truyền máu</DialogTitle>
        <DialogContent>
          {selected && (
            <Box sx={{ display: 'grid', rowGap: 1 }}>
              <Typography><b>Ngày yêu cầu:</b> {formatDate(selected.requestDate)}</Typography>
              <Typography><b>Nhóm máu:</b> {selected.bloodType_BloodTypeName || selected.bloodTypeName}</Typography>
              <Typography><b>Thành phần:</b> {selected.component_ComponentName || selected.componentName}</Typography>
              <Typography><b>Thể tích:</b> {selected.transfusionVolume} ml</Typography>
              <Typography><b>Ghi chú:</b> {selected.notes}</Typography>
              <Typography><b>Tình trạng bệnh nhân:</b> {selected.patientCondition}</Typography>
              <Chip label={selected.status} color={getStatusColor(selected.status)} sx={{ fontWeight: 'bold', borderRadius: 2, mt: 1 }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransfusionHistory;

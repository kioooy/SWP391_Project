import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Avatar,
  Grid,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Paper
} from '@mui/material';
import { Bloodtype, CalendarToday, LocalHospital, Close, BadgeOutlined } from '@mui/icons-material';
import dayjs from 'dayjs';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

// Thêm đối tượng ánh xạ dịch thuật cho thành phần máu
const bloodComponentTranslations = {
  "Whole Blood": "Máu toàn phần",
  "Red Blood Cells": "Hồng cầu",
  "Plasma": "Huyết tương",
  "Platelets": "Tiểu cầu",
};

// Thêm đối tượng ánh xạ dịch thuật cho trạng thái truyền máu
const transfusionStatusTranslations = {
  "Completed": "Hoàn thành",
  "Hoàn thành": "Hoàn thành",
  "Approved": "Đã duyệt",
  "Đã duyệt": "Đã duyệt",
  "Pending": "Chờ duyệt",
  "Chờ duyệt": "Chờ duyệt",
  "Processing": "Đang xử lý",
  "Đang xử lý": "Đang xử lý",
  "Cancelled": "Đã hủy",
  "Đã hủy": "Đã hủy",
  "Rejected": "Từ chối",
  "Từ chối": "Từ chối",
};

const getStatusChip = (status) => {
  const label = transfusionStatusTranslations[status] || status;
  switch (label) {
    case 'Hoàn thành':
      return <Chip label="Hoàn thành" size="small" sx={{ backgroundColor: '#757575', color: 'white', fontWeight: 600 }} />;
    case 'Đã duyệt':
      return <Chip label="Đã duyệt" color="success" size="small" />;
    case 'Chờ duyệt':
      return <Chip label="Chờ duyệt" color="warning" size="small" />;
    case 'Đang xử lý':
      return <Chip label="Đang xử lý" color="primary" size="small" />;
    case 'Đã hủy':
      return <Chip label="Đã hủy" color="error" size="small" />;
    case 'Từ chối':
      return <Chip label="Từ chối" color="error" size="small" />;
    default:
      return <Chip label={label} size="small" />;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return dayjs(dateString).format('DD/MM/YYYY');
};

const TransfusionHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [open, setOpen] = useState(false);

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
      } catch (err) {
        setError(err.message || 'Lỗi khi tải lịch sử truyền máu');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleDetail = (item) => {
    setSelected(item);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>
        ) : error ? (
          <Alert severity="error" sx={{ my: 4 }}>{error}</Alert>
        ) : history.length === 0 ? (
          <Alert severity="info" sx={{ my: 4 }}>Bạn chưa có lịch sử truyền máu nào.</Alert>
        ) : (
          history.map((item, idx) => (
            <Box key={item.transfusionId || idx} sx={{ p: 2, mb: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #dee2e6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Grid container spacing={2} sx={{ flex: 1 }}>
                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary">Ngày yêu cầu</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {formatDate(item.requestDate)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary">Thành phần</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {bloodComponentTranslations[item.componentName] || item.componentName || '---'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Typography variant="body2" color="text.secondary">Nhóm máu</Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {item.bloodTypeName || item.bloodType_BloodTypeName || '---'}
                  </Typography>
                </Grid>
             
              </Grid>
              <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 2, ml: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 1 }}>
                  <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                  {getStatusChip(item.status)}
                </Box>
                <Button
                  variant="outlined"
                  sx={{ minWidth: 120 }}
                  onClick={() => handleDetail(item)}
                >
                  Chi tiết
                </Button>
              </Box>
            </Box>
          ))
        )}

        {/* Dialog Chi tiết truyền máu */}
        <Dialog
          open={open}
          onClose={handleClose}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
        >
          <DialogTitle sx={{ bgcolor: '#4285f4', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Chi tiết truyền máu
            </Typography>
            <IconButton onClick={handleClose} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {selected && (
              <Box>
                <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa' }}>
                  <Grid container spacing={3}>
                    {/* Thông tin truyền máu bên trái */}
                    <Grid item xs={12} md={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      </Box>
                      <Box>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <BadgeOutlined sx={{ color: '#757575', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">Mã truyền máu</Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{selected.transfusionId}</Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Bloodtype sx={{ color: '#757575', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">Nhóm máu</Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{selected.bloodType_BloodTypeName || selected.bloodTypeName}</Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LocalHospital sx={{ color: '#757575', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">Thành phần</Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{bloodComponentTranslations[selected.component_ComponentName || selected.componentName] || selected.component_ComponentName || selected.componentName}</Typography>
                        </Box>
                        {/* Thể tích */}
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Bloodtype sx={{ color: '#757575', mr: 1 }} />
                            <Typography variant="body2" color="text.secondary" sx={{ ml: 0 }}>Thể tích</Typography>
                          </Box>
                          <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{selected.transfusionVolume} ml</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    {/* Thông tin truyền máu bên phải */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">Ngày yêu cầu</Typography>
                      <Typography variant="body1" fontWeight="bold">{formatDate(selected.requestDate)}</Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                        {getStatusChip(selected.status)}
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>Ghi chú</Typography>
                        <Typography variant="body1" fontWeight="bold">{selected.notes || '---'}</Typography>
                        <Typography variant="body2" color="text.secondary">Tình trạng bệnh nhân</Typography>
                        <Typography variant="body1" fontWeight="bold">{selected.patientCondition || '---'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={handleClose} variant="outlined" color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
};

export default TransfusionHistory; 
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
import { Bloodtype, CalendarToday, LocalHospital, Close, BadgeOutlined, Badge, Phone, Cake } from '@mui/icons-material';
import dayjs from 'dayjs';
import axios from 'axios';

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
  const [userDetail, setUserDetail] = useState(null); // Thêm state userDetail

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

  // Khi mở dialog chi tiết, gọi API lấy userDetail
  const handleDetail = async (item) => {
    setSelected(item);
    setOpen(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/User/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = Array.isArray(res.data) ? res.data[0] : res.data;
      console.log('User profile:', userData); // Thêm log kiểm tra dữ liệu trả về
      setUserDetail(userData);
    } catch {
      setUserDetail(null);
    }
  };
  const handleClose = () => {
    setOpen(false);
    setSelected(null);
    setUserDetail(null);
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
                    {/* Đổi vị trí: Thông tin người dùng bên trái, Thông tin truyền máu bên phải */}
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Thông tin người dùng
                      </Typography>
                      {(() => {
                        // Ưu tiên lấy từ userDetail nếu có (giống AppointmentHistory.js)
                        let user = null;
                        try {
                          user = JSON.parse(localStorage.getItem('user'));
                        } catch {}
                        const fullName = userDetail?.fullName || user?.fullName || user?.member?.fullName || selected.fullName || '---';
                        const citizenNumber = userDetail?.citizenNumber || user?.citizenNumber || user?.member?.citizenNumber || selected.citizenNumber || '---';
                        const phoneNumber = userDetail?.phoneNumber || user?.phone || user?.phoneNumber || user?.member?.phoneNumber || selected.phoneNumber || '---';
                        const dateOfBirth = userDetail?.dateOfBirth || user?.dateOfBirth || user?.member?.dateOfBirth || selected.dateOfBirth || null;
                        const bloodType = userDetail?.bloodTypeName || user?.bloodTypeName || user?.bloodType || user?.member?.bloodTypeName || selected.bloodTypeName || '---';
                        return (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', mr: 2 }}>
                                {(fullName || 'U').charAt(0)}
                              </Avatar>
                              <Typography variant="body1" fontWeight="bold">{fullName}</Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Badge sx={{ color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">Số CCCD</Typography>
                              </Box>
                              <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{citizenNumber}</Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Bloodtype sx={{ color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">Nhóm máu</Typography>
                              </Box>
                              <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{bloodType}</Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Phone sx={{ color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">Số điện thoại</Typography>
                              </Box>
                              <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{phoneNumber}</Typography>
                            </Box>
                            <Box sx={{ mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Cake sx={{ color: 'text.secondary', mr: 1 }} />
                                <Typography variant="body2" color="text.secondary">Ngày sinh</Typography>
                              </Box>
                              <Typography variant="body1" fontWeight="bold" sx={{ ml: 4 }}>{dateOfBirth ? dayjs(dateOfBirth).format('DD/MM/YYYY') : '---'}</Typography>
                            </Box>
                          </>
                        );
                      })()}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                        Thông tin truyền máu
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Mã truyền máu</Typography>
                        <Typography variant="body1" fontWeight="bold">{selected.transfusionId || '---'}</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Trạng thái</Typography>
                        {getStatusChip(selected.status)}
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Nhóm máu truyền</Typography>
                        <Typography variant="body1" fontWeight="bold">{selected.bloodType_BloodTypeName || selected.bloodTypeName || '---'}</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Thành phần</Typography>
                        <Typography variant="body1" fontWeight="bold">
                          {bloodComponentTranslations[selected.component_ComponentName || selected.componentName] || selected.component_ComponentName || selected.componentName || '---'}
                        </Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Thể tích</Typography>
                        <Typography variant="body1" fontWeight="bold">{selected.transfusionVolume ? `${selected.transfusionVolume} ml` : '---'}</Typography>
                      </Box>
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Ngày yêu cầu</Typography>
                        <Typography variant="body1" fontWeight="bold">{formatDate(selected.requestDate)}</Typography>
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
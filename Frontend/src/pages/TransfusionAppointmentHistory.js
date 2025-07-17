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

const TransfusionAppointmentHistory = () => {
  // Chờ backend bổ sung API lấy lịch hẹn truyền máu sắp tới cho member truyền máu
  // Hiện tại chỉ hiển thị thông báo placeholder

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="info" sx={{ my: 4, fontSize: 18, textAlign: 'center' }}>
        Chức năng xem lịch hẹn truyền máu sẽ được cập nhật khi backend bổ sung API.
      </Alert>

        {/* Dialog Chi tiết truyền máu */}
        <Dialog
          open={false} // Dialog này không được mở từ component này, nó được mở từ TransfusionAppointmentHistory.js
          onClose={() => {}}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, maxHeight: '90vh' } }}
        >
          <DialogTitle sx={{ bgcolor: '#4285f4', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="bold">
              Chi tiết truyền máu
            </Typography>
            <IconButton onClick={() => {}} sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            {/* Content for detail dialog will be added here when API is ready */}
            <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
              Thông tin chi tiết truyền máu sẽ được hiển thị khi có dữ liệu.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => {}} variant="outlined" color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
};

export default TransfusionAppointmentHistory; 
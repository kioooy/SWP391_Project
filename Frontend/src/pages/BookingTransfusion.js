import React, { useState } from 'react';
import {
  Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Paper, Alert
} from '@mui/material';
import axios from 'axios';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS = [
  { value: 'whole-blood', label: 'Truyền toàn phần (Nhóm máu)' },
  { value: 'red-cell', label: 'Hồng cầu' },
  { value: 'plasma', label: 'Huyết tương' },
  { value: 'platelet', label: 'Tiểu cầu' },
];

// Map tên nhóm máu sang ID
const BLOOD_TYPE_ID_MAP = {
  'O-': 1,
  'O+': 2,
  'A-': 3,
  'A+': 4,
  'B-': 5,
  'B+': 6,
  'AB-': 7,
  'AB+': 8,
};
// Map component sang ID (nếu cần cho các API khác)
const COMPONENT_ID_MAP = {
  'whole-blood': 1,
  'red-cell': 2,
  'plasma': 3,
  'platelet': 4,
};

const BookingTransfusion = () => {
  const [bloodType, setBloodType] = useState('A+');
  const [component, setComponent] = useState('whole-blood');
  const [volume, setVolume] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [canRequest, setCanRequest] = useState(false);
  const [showRequestDonor, setShowRequestDonor] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    setSearchResult(null);
    setShowRequestDonor(false);
    setCanRequest(false);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const token = localStorage.getItem('token');
      const bloodTypeId = BLOOD_TYPE_ID_MAP[bloodType];
      if (!bloodTypeId) {
        setError('Nhóm máu không hợp lệ!');
        setLoading(false);
        return;
      }

      // Luôn tạo yêu cầu ở trạng thái Pending, không cần kiểm tra kho
      await axios.post(`${API_URL}/TransfusionRequest`, {
        bloodTypeId,
        componentId: COMPONENT_ID_MAP[component],
        transfusionVolume: volume, // Đổi tên trường cho đúng với DTO
        preferredReceiveDate: date,
        notes,
        status: 'Pending' // Luôn là Pending
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSuccess(true);
      setLoading(false);

    } catch (err) {
      if (err.response && err.response.data && err.response.data.errors) {
        const errorMessages = Object.values(err.response.data.errors).flat().join(' ');
        setError(`Đặt lịch thất bại: ${errorMessages}`);
      } else {
        setError('Đặt lịch thất bại! Vui lòng kiểm tra lại thông tin.');
      }
      setLoading(false);
    }
  };

  const handleRequestDonor = async () => {
    setError('');
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const bloodTypeId = BLOOD_TYPE_ID_MAP[bloodType];
      await axios.post(`${API_URL}/BloodSearch/request-donors-with-hospital/${bloodTypeId}/${volume}`);
      setSuccess(true);
      setShowRequestDonor(false);
    } catch (err) {
      setError('Gửi yêu cầu huy động người hiến thất bại!');
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Đặt lịch truyền máu
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Nhóm máu cần nhận</InputLabel>
            <Select
              value={bloodType}
              label="Nhóm máu cần nhận"
              onChange={e => setBloodType(e.target.value)}
            >
              {BLOOD_TYPES.map(type => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Loại truyền</InputLabel>
            <Select
              value={component}
              label="Loại truyền"
              onChange={e => setComponent(e.target.value)}
            >
              {COMPONENTS.map(c => (
                <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Số lượng (ml)"
            type="number"
            value={volume}
            onChange={e => setVolume(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Ngày mong muốn truyền"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            required
          />
          <TextField
            fullWidth
            label="Ghi chú (tuỳ chọn)"
            multiline
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Đặt lịch truyền máu'}
          </Button>
        </Box>
        {searchResult && (
          <Alert severity={canRequest ? 'success' : 'warning'} sx={{ mt: 2 }}>
            {canRequest
              ? 'Đủ máu trong kho, có thể đặt lịch truyền máu.'
              : 'Không đủ máu trong kho. Bạn có muốn gửi yêu cầu huy động người hiến không?'}
          </Alert>
        )}
        {showRequestDonor && (
          <Button variant="outlined" color="secondary" onClick={handleRequestDonor} sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Huy động người hiến máu'}
          </Button>
        )}
        {success && <Alert severity="success" sx={{ mt: 2 }}>Đặt lịch truyền máu thành công!</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Container>
  );
};

export default BookingTransfusion; 
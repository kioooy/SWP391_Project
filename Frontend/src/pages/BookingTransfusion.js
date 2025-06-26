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
      // 1. Gọi API tìm kiếm máu
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      // Giả sử bloodType là tên, cần map sang id thực tế nếu backend yêu cầu
      // Ở đây demo truyền trực tiếp tên nhóm máu
      const searchRes = await axios.get(`${API_URL}/BloodSearch/search-with-hospital-location/${bloodType}/${volume}`);
      setSearchResult(searchRes.data);
      if (searchRes.data && searchRes.data.availableVolume >= volume) {
        // Đủ máu, cho phép đặt lịch
        setCanRequest(true);
        // Gửi yêu cầu truyền máu
        await axios.post(`${API_URL}/TransfusionRequest`, {
          bloodType,
          component,
          volume,
          preferredReceiveDate: date,
          notes
        });
        setSuccess(true);
      } else {
        // Không đủ máu, hiển thị nút huy động người hiến
        setShowRequestDonor(true);
      }
      setLoading(false);
    } catch (err) {
      setError('Đặt lịch thất bại!');
      setLoading(false);
    }
  };

  const handleRequestDonor = async () => {
    setError('');
    setLoading(true);
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      await axios.post(`${API_URL}/BloodSearch/request-donors-with-hospital/${bloodType}/${volume}`);
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
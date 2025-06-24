import React, { useState } from 'react';
import {
  Container, Typography, Box, FormControl, InputLabel, Select, MenuItem, TextField, Button, Paper, Alert
} from '@mui/material';
// import axios from 'axios'; // Bỏ comment nếu có API thực tế

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);
    try {
      // TODO: Gửi dữ liệu lên API đặt lịch truyền máu
      // await axios.post('/api/TransfusionRequest', { ... });
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setError('Đặt lịch thất bại!');
      setLoading(false);
    }
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
        {success && <Alert severity="success" sx={{ mt: 2 }}>Đặt lịch truyền máu thành công!</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Container>
  );
};

export default BookingTransfusion; 
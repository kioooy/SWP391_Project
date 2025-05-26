import React, { useState } from 'react';
import { Typography, Box, Button, Container, TextField } from '@mui/material'; // Import TextField
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const Home = () => {
  const navigate = useNavigate();
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);

  const handleSearch = () => {
    if (!fromDate || !toDate) return;
    navigate(`/events?from=${dayjs(fromDate).format('YYYY-MM-DD')}&to=${dayjs(toDate).format('YYYY-MM-DD')}`);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Bạn cần đặt lịch hiến máu vào thời gian nào?
        </Typography>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Box display="flex" alignItems="center" gap={2}>
            <DatePicker
              label="Từ ngày"
              value={fromDate}
              onChange={setFromDate}
              renderInput={(params) => <TextField {...params} size="small" />} // Thêm renderInput
            />
            <DatePicker
              label="Đến ngày"
              value={toDate}
              onChange={setToDate}
              renderInput={(params) => <TextField {...params} size="small" />} // Thêm renderInput
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={!fromDate || !toDate}
            >
              Tìm kiếm
            </Button>
          </Box>
        </LocalizationProvider>
      </Box>

    </Container>
  );
};

export default Home;
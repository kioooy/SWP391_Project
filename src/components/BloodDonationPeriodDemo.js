import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert
} from '@mui/material';
import CreateBloodDonationPeriod from './CreateBloodDonationPeriod';
import BloodDonationPeriodCard from './BloodDonationPeriodCard';

const BloodDonationPeriodDemo = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [demoPeriods, setDemoPeriods] = useState([
    {
      periodId: 1,
      periodName: "Đợt Hiến Máu Tình Nguyện Tháng 12",
      location: "Bệnh viện Chợ Rẫy, TP.HCM",
      status: "Active",
      periodDateFrom: "2024-12-15T08:00:00",
      periodDateTo: "2024-12-20T17:00:00",
      targetQuantity: 500,
      currentQuantity: 320,
      imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=200&fit=crop"
    },
    {
      periodId: 2,
      periodName: "Hiến Máu Nhân Đạo Tết 2025",
      location: "Trung tâm Truyền máu Quốc gia, Hà Nội",
      status: "Active",
      periodDateFrom: "2025-01-20T08:00:00",
      periodDateTo: "2025-01-25T17:00:00",
      targetQuantity: 800,
      currentQuantity: 150,
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop"
    },
    {
      periodId: 3,
      periodName: "Đợt Hiến Máu Khẩn Cấp",
      location: "Bệnh viện Bạch Mai, Hà Nội",
      status: "Completed",
      periodDateFrom: "2024-11-01T08:00:00",
      periodDateTo: "2024-11-05T17:00:00",
      targetQuantity: 300,
      currentQuantity: 300,
      imageUrl: "https://images.unsplash.com/photo-1581595219315-a187dd40c322?w=400&h=200&fit=crop"
    }
  ]);

  const handleCreateSuccess = (newPeriod) => {
    setDemoPeriods([...demoPeriods, { ...newPeriod, periodId: demoPeriods.length + 1 }]);
  };

  const handleRegister = (period) => {
    alert(`Đăng ký hiến máu cho đợt: ${period.periodName}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Demo - Chức Năng Đợt Hiến Máu
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Đây là trang demo để test chức năng tạo và hiển thị đợt hiến máu. 
        Dữ liệu hiển thị là dữ liệu mẫu, không được lưu vào database.
      </Alert>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Tạo Đợt Hiến Máu Mới (Demo)
        </Button>
      </Box>

      <Grid container spacing={3}>
        {demoPeriods.map((period) => (
          <Grid item xs={12} sm={6} md={4} key={period.periodId}>
            <BloodDonationPeriodCard
              period={period}
              onRegister={handleRegister}
            />
          </Grid>
        ))}
      </Grid>

      <CreateBloodDonationPeriod
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </Box>
  );
};

export default BloodDonationPeriodDemo; 
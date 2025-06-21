import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Alert,
  Card,
  CardContent
} from '@mui/material';
import CreateBloodDonationPeriod from './CreateBloodDonationPeriod';
import BloodDonationPeriodCard from './BloodDonationPeriodCard';
import axios from 'axios';

const BloodDonationPeriodSingleHospitalDemo = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [hospital, setHospital] = useState(null);
  const [demoPeriods, setDemoPeriods] = useState([
    {
      periodId: 1,
      periodName: "Đợt Hiến Máu Tình Nguyện Tháng 12",
      location: "Bệnh viện Chợ Rẫy - 201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
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
      location: "Bệnh viện Chợ Rẫy - 201B Nguyễn Chí Thanh, Quận 5, TP.HCM",
      status: "Active",
      periodDateFrom: "2025-01-20T08:00:00",
      periodDateTo: "2025-01-25T17:00:00",
      targetQuantity: 800,
      currentQuantity: 150,
      imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=200&fit=crop"
    }
  ]);

  useEffect(() => {
    fetchHospital();
  }, []);

  const fetchHospital = async () => {
    try {
      const response = await axios.get('/api/Hospital');
      setHospital(response.data);
    } catch (error) {
      console.error('Error fetching hospital:', error);
    }
  };

  const handleCreateSuccess = (newPeriod) => {
    setDemoPeriods([...demoPeriods, { ...newPeriod, periodId: demoPeriods.length + 1 }]);
  };

  const handleRegister = (period) => {
    alert(`Đăng ký hiến máu cho đợt: ${period.periodName}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Demo - Chức Năng Đợt Hiến Máu (1 Bệnh Viện)
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Đây là trang demo để test chức năng tạo đợt hiến máu với 1 bệnh viện duy nhất. 
        Dữ liệu hiển thị là dữ liệu mẫu, không được lưu vào database.
      </Alert>

      {/* Thông tin bệnh viện */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Thông Tin Bệnh Viện
        </Typography>
        {hospital ? (
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary" gutterBottom>
                {hospital.name}
              </Typography>
              <Typography variant="body1" paragraph>
                {hospital.address}
              </Typography>
              {hospital.phone && (
                <Typography variant="body2" color="text.secondary">
                  Điện thoại: {hospital.phone}
                </Typography>
              )}
              {hospital.email && (
                <Typography variant="body2" color="text.secondary">
                  Email: {hospital.email}
                </Typography>
              )}
            </CardContent>
          </Card>
        ) : (
          <Typography color="text.secondary">
            Không có thông tin bệnh viện trong hệ thống
          </Typography>
        )}
      </Paper>

      <Box sx={{ mb: 4 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => setCreateDialogOpen(true)}
          sx={{ mb: 2 }}
        >
          Tạo Đợt Hiến Máu Mới
        </Button>
      </Box>

      <Typography variant="h6" gutterBottom>
        Các Đợt Hiến Máu Mẫu
      </Typography>

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

export default BloodDonationPeriodSingleHospitalDemo; 
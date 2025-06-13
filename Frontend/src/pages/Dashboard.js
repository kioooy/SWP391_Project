import React from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Bloodtype,
  People,
  LocalHospital,
  CalendarToday,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  // Dữ liệu mẫu cho biểu đồ
  const bloodTypeData = [
    { name: 'A+', value: 150 },
    { name: 'A-', value: 50 },
    { name: 'B+', value: 120 },
    { name: 'B-', value: 40 },
    { name: 'AB+', value: 80 },
    { name: 'AB-', value: 30 },
    { name: 'O+', value: 200 },
    { name: 'O-', value: 60 },
  ];

  const monthlyDonationData = [
    { name: 'T1', donations: 120, requests: 100 },
    { name: 'T2', donations: 150, requests: 130 },
    { name: 'T3', donations: 180, requests: 160 },
    { name: 'T4', donations: 160, requests: 140 },
    { name: 'T5', donations: 140, requests: 120 },
    { name: 'T6', donations: 200, requests: 180 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Dữ liệu mẫu cho bảng yêu cầu máu gần đây
  const recentRequests = [
    {
      id: 1,
      hospital: 'Bệnh viện Chợ Rẫy',
      bloodType: 'A+',
      quantity: 5,
      urgency: 'Khẩn cấp',
      status: 'pending',
      date: '2024-03-15',
    },
    {
      id: 2,
      hospital: 'Bệnh viện Nhi Đồng 1',
      bloodType: 'O-',
      quantity: 3,
      urgency: 'Bình thường',
      status: 'completed',
      date: '2024-03-14',
    },
    {
      id: 3,
      hospital: 'Bệnh viện 115',
      bloodType: 'B+',
      quantity: 4,
      urgency: 'Cấp bách',
      status: 'processing',
      date: '2024-03-13',
    },
  ];

  // Dữ liệu mẫu cho bảng đơn vị máu sắp hết hạn
  const expiringBlood = [
    {
      id: 1,
      bloodType: 'A+',
      quantity: 5,
      expiryDate: '2024-03-20',
      status: 'warning',
    },
    {
      id: 2,
      bloodType: 'B+',
      quantity: 3,
      expiryDate: '2024-03-22',
      status: 'warning',
    },
    {
      id: 3,
      bloodType: 'O-',
      quantity: 2,
      expiryDate: '2024-03-25',
      status: 'warning',
    },
  ];

  const getStatusChip = (status) => {
    switch (status) {
      case 'pending':
        return (
          <Chip
            icon={<Warning />}
            label="Chờ xử lý"
            color="warning"
            size="small"
          />
        );
      case 'processing':
        return (
          <Chip
            icon={<TrendingUp />}
            label="Đang xử lý"
            color="primary"
            size="small"
          />
        );
      case 'completed':
        return (
          <Chip
            icon={<CheckCircle />}
            label="Hoàn thành"
            color="success"
            size="small"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Dashboard
      </Typography>

      {/* Thống kê tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Bloodtype sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Tổng đơn vị máu
                  </Typography>
                  <Typography variant="h4">730</Typography>
                </Box>
              </Box>
              <LinearProgress variant="determinate" value={70} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Đạt 70% mục tiêu
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Người hiến máu
                  </Typography>
                  <Typography variant="h4">1,250</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="success.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 0.5 }} />
                Tăng 15% so với tháng trước
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospital sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Yêu cầu máu
                  </Typography>
                  <Typography variant="h4">45</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="error.main" sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDown sx={{ mr: 0.5 }} />
                Giảm 5% so với tháng trước
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    Lịch hiến máu
                  </Typography>
                  <Typography variant="h4">28</Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Lịch hiến trong tuần này
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Biểu đồ */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thống kê hiến máu theo tháng
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyDonationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="donations" name="Lượt hiến" fill="#8884d8" />
                    <Bar dataKey="requests" name="Yêu cầu" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Phân bố nhóm máu
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bloodTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {bloodTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Bảng thông tin */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Yêu cầu máu gần đây
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Bệnh viện</TableCell>
                      <TableCell>Nhóm máu</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentRequests.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.hospital}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.bloodType}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{getStatusChip(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Đơn vị máu sắp hết hạn
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhóm máu</TableCell>
                      <TableCell>Số lượng</TableCell>
                      <TableCell>Ngày hết hạn</TableCell>
                      <TableCell>Trạng thái</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {expiringBlood.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <Chip
                            label={row.bloodType}
                            color="error"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{row.expiryDate}</TableCell>
                        <TableCell>
                          <Chip
                            icon={<Warning />}
                            label="Sắp hết hạn"
                            color="warning"
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 
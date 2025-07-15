import React, { useEffect, useState } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, LinearProgress, Divider
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Warning, CheckCircle, Bloodtype, People, LocalHospital, CalendarToday
} from '@mui/icons-material';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [bloodInventory, setBloodInventory] = useState(null);
  const [donationAnalytics, setDonationAnalytics] = useState(null);
  const [transfusionAnalytics, setTransfusionAnalytics] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5250/api";
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchApi = async (url, setter, emptyValue = null) => {
      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) {
          setter(emptyValue);
          return;
        }
        const text = await res.text();
        if (!text) {
          setter(emptyValue);
          return;
        }
        setter(JSON.parse(text));
      } catch (err) {
        setter(emptyValue);
      }
    };

    fetchApi(`${API_URL}/Dashboard/total-number`, setSummary, null);
    fetchApi(`${API_URL}/Dashboard/blood-inventory`, setBloodInventory, null);
    fetchApi(`${API_URL}/Dashboard/donation-analytics`, setDonationAnalytics, null);
    fetchApi(`${API_URL}/Dashboard/transfusion-analytics`, setTransfusionAnalytics, null);
    fetchApi(`${API_URL}/Dashboard/recent-activity`, setRecentActivity, []);
  }, []);

  const getStatusChip = (status) => {
    if (!status) return null;
    switch (status.toLowerCase()) {
      case 'pending':
        return <Chip icon={<Warning />} label="Chờ xử lý" color="warning" size="small" />;
      case 'processing':
        return <Chip icon={<TrendingUp />} label="Đang xử lý" color="primary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Hoàn thành" color="success" size="small" />;
      case 'approved':
        return <Chip icon={<CheckCircle />} label="Đã duyệt" color="primary" size="small" />;
      case 'cancelled':
        return <Chip icon={<Warning />} label="Đã hủy" color="error" size="small" />;
      case 'rejected':
        return <Chip icon={<Warning />} label="Từ chối" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Blood Inventory data
  const bloodByType = bloodInventory?.bloodByType || [];
  const bloodByComponent = bloodInventory?.bloodByComponent || [];

  // Donation Analytics
  const donationByStatus = donationAnalytics?.donationByStatus || [];
  const staffDonation = donationAnalytics?.staffResponsible || [];
  const totalDonationVolume = donationAnalytics?.totalDonationVolume || 0;

  // Transfusion Analytics
  const transfusionByStatus = transfusionAnalytics?.donationByStatus || [];
  const staffTransfusion = transfusionAnalytics?.staffResponsible || [];
  const memberTransfusion = transfusionAnalytics?.memberTransfusion || [];
  const bloodTypeTransfusion = transfusionAnalytics?.bloodType || [];
  const componentTransfusion = transfusionAnalytics?.component || [];
  const totalTransfusionVolume = transfusionAnalytics?.totalDonationVolume || 0;

  // Đối tượng ánh xạ dịch thuật cho thành phần máu
  const bloodComponentTranslations = {
    "Whole Blood": "Máu toàn phần",
    "Red Blood Cells": "Hồng cầu",
    "Plasma": "Huyết tương",
    "Platelets": "Tiểu cầu",
  };

  // Thêm hàm dịch loại hoạt động sang tiếng Việt
  const mapActivityTypeToVN = (type) => {
    switch (type) {
      case 'Donation':
        return 'Hiến máu';
      case 'Transfusion':
        return 'Truyền máu';
      case 'UrgentRequest':
        return 'Yêu cầu khẩn cấp';
      case 'DonationRequest':
        return 'Yêu cầu hiến máu';
      case 'TransfusionRequest':
        return 'Yêu cầu truyền máu';
      case 'BloodComponent':
        return 'Thành phần máu';
      default:
        return type;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Dashboard
      </Typography>

      {/* Tổng quan */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Bloodtype sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                <Typography variant="h6" color="text.secondary">Đơn vị máu</Typography>
                <Typography variant="h4">{summary?.totalBloodUnits ?? '-'}</Typography>
                </Box>
              </Box>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <People sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                <Typography variant="h6" color="text.secondary">Thành viên</Typography>
                <Typography variant="h4">{summary?.totalMembers ?? '-'}</Typography>
                </Box>
              </Box>
            
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalHospital sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                <Typography variant="h6" color="text.secondary">Yêu cầu hiến máu</Typography>
                <Typography variant="h4">{summary?.totalDonationRequests ?? '-'}</Typography>
                </Box>
              </Box>
  
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card><CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarToday sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                <Typography variant="h6" color="text.secondary">Yêu cầu truyền máu</Typography>
                <Typography variant="h4">{summary?.totalTransfusionRequests ?? '-'}</Typography>
              </Box>
            </Box>
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Blood Inventory */}
      <Card sx={{ mb: 4 }}>
            <CardContent>
          <Typography variant="h6" gutterBottom>Thống kê kho máu</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Theo nhóm máu</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhóm máu</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodByType.map((row) => (
                      <TableRow key={row.bloodTypeId}>
                        <TableCell>{row.bloodTypeName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold">Theo thành phần máu</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thành phần</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodByComponent.map((row) => (
                      <TableRow key={row.componentId}>
                        <TableCell>{bloodComponentTranslations[row.componentName] || row.componentName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
            </CardContent>
          </Card>

      {/* Donation Analytics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Thống kê hiến máu</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Tổng thể tích máu đã hiến</Typography>
              <Typography variant="h5" color="primary">{totalDonationVolume} ml</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Trạng thái yêu cầu</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {donationByStatus.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{getStatusChip(row.status)}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        </Grid>
        <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Top nhân viên phụ trách</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffDonation.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
            </CardContent>
          </Card>

      {/* Transfusion Analytics */}
      <Card sx={{ mb: 4 }}>
            <CardContent>
          <Typography variant="h6" gutterBottom>Thống kê truyền máu</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Tổng thể tích truyền máu</Typography>
              <Typography variant="h5" color="primary">{totalTransfusionVolume} ml</Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Trạng thái yêu cầu</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Trạng thái</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transfusionByStatus.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{getStatusChip(row.status)}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Top nhân viên phụ trách</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhân viên</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {staffTransfusion.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Top thành viên truyền máu</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thành viên</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {memberTransfusion.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.fullName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Top nhóm máu truyền</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nhóm máu</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodTypeTransfusion.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{row.bloodTypeName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1">Top thành phần máu truyền</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Thành phần</TableCell>
                      <TableCell align="right">Số lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {componentTransfusion.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{bloodComponentTranslations[row.componentName] || row.componentName}</TableCell>
                        <TableCell align="right">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Hoạt động gần đây */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Hoạt động gần đây</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* Thêm cột Người dùng */}
                  <TableCell>Người dùng</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Ngày</TableCell>
                  <TableCell>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentActivity.map((row, idx) => (
                  <TableRow key={idx}>
                    {/* Hiển thị tên người dùng */}
                    <TableCell>{row.userName || row.fullName || 'Không rõ'}</TableCell>
                    <TableCell>{mapActivityTypeToVN(row.type)}</TableCell>
                    <TableCell>{row.requestDate?.slice(0, 10)}</TableCell>
                    <TableCell>{getStatusChip(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
    </Container>
  );
};

export default Dashboard; 
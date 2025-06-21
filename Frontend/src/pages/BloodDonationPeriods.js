import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Container,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  TextField,
  InputAdornment
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import axios from 'axios';
import BloodDonationPeriodCard from '../components/BloodDonationPeriodCard';
import dayjs from 'dayjs';

const BloodDonationPeriods = () => {
  const [periods, setPeriods] = useState([]);
  const [filteredPeriods, setFilteredPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPeriods();
  }, []);

  useEffect(() => {
    filterPeriods();
  }, [periods, activeTab, searchTerm]);

  const fetchPeriods = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/BloodDonationPeriod');
      setPeriods(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching periods:', err);
      setError('Không thể tải danh sách đợt hiến máu');
    } finally {
      setLoading(false);
    }
  };

  const filterPeriods = () => {
    let filtered = periods;

    // Filter by tab
    switch (activeTab) {
      case 0: // Tất cả
        break;
      case 1: // Đang diễn ra
        filtered = filtered.filter(period => 
          period.status === 'Active' && 
          dayjs().isAfter(dayjs(period.periodDateFrom)) && 
          dayjs().isBefore(dayjs(period.periodDateTo))
        );
        break;
      case 2: // Sắp diễn ra
        filtered = filtered.filter(period => 
          period.status === 'Active' && 
          dayjs().isBefore(dayjs(period.periodDateFrom))
        );
        break;
      case 3: // Đã hoàn thành
        filtered = filtered.filter(period => period.status === 'Completed');
        break;
      default:
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(period =>
        period.periodName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        period.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPeriods(filtered);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleRegister = (period) => {
    // TODO: Implement registration logic
    alert(`Đăng ký hiến máu cho đợt: ${period.periodName}`);
  };

  const getTabLabel = (index) => {
    const count = periods.filter((period, i) => {
      switch (index) {
        case 0:
          return true;
        case 1:
          return period.status === 'Active' && 
            dayjs().isAfter(dayjs(period.periodDateFrom)) && 
            dayjs().isBefore(dayjs(period.periodDateTo));
        case 2:
          return period.status === 'Active' && 
            dayjs().isBefore(dayjs(period.periodDateFrom));
        case 3:
          return period.status === 'Completed';
        default:
          return false;
      }
    }).length;

    const labels = ['Tất cả', 'Đang diễn ra', 'Sắp diễn ra', 'Đã hoàn thành'];
    return `${labels[index]} (${count})`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
        Đợt Hiến Máu
      </Typography>
      
      <Typography variant="h6" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Tham gia các đợt hiến máu để cứu sống nhiều người
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm đợt hiến máu..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label={getTabLabel(0)} />
          <Tab label={getTabLabel(1)} />
          <Tab label={getTabLabel(2)} />
          <Tab label={getTabLabel(3)} />
        </Tabs>
      </Box>

      {/* Results */}
      {filteredPeriods.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm 
              ? 'Không tìm thấy đợt hiến máu nào phù hợp với từ khóa tìm kiếm'
              : 'Hiện tại không có đợt hiến máu nào'
            }
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredPeriods.map((period) => (
            <Grid item xs={12} sm={6} md={4} key={period.periodId}>
              <BloodDonationPeriodCard
                period={period}
                onRegister={handleRegister}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default BloodDonationPeriods; 
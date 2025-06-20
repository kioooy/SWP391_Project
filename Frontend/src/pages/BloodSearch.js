import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Grid,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import { Search as SearchIcon, LocationOn, Bloodtype } from '@mui/icons-material';

const BloodSearch = () => {
  const [bloodType, setBloodType] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState([]);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Nha Trang'];

  const handleSearch = () => {
    // Logic tìm kiếm máu giả định
    console.log('Searching for blood:', { bloodType, city });
    
    // Dữ liệu kết quả giả định
    const dummyResults = [
      {
        id: 1,
        name: 'Bệnh viện Truyền máu Huyết học',
        address: '118 Hồng Bàng, Phường 12, Quận 5, TP.HCM',
        availableBlood: {'A+': 'Có', 'B+': 'Có', 'O+': 'Có', 'AB-': 'Ít'},
        contact: '028-12345678',
        distance: '2.5 km',
        lastUpdated: '2 giờ trước',
      },
      {
        id: 2,
        name: 'Trung tâm Hiến máu Nhân đạo',
        address: '106 Thiên Phước, Phường 9, Tân Bình, TP.HCM',
        availableBlood: {'A+': 'Ít', 'AB+': 'Có', 'B-': 'Có'},
        contact: '028-98765432',
        distance: '5.1 km',
        lastUpdated: '1 ngày trước',
      },
      {
        id: 3,
        name: 'Bệnh viện Chợ Rẫy',
        address: '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP.HCM',
        availableBlood: {'O+': 'Có', 'A-': 'Có'},
        contact: '028-76543210',
        distance: '3.0 km',
        lastUpdated: '30 phút trước',
      },
      {
        id: 4,
        name: 'Bệnh viện Đại học Y Dược TP.HCM',
        address: '215 Hồng Bàng, Phường 11, Quận 5, TP.HCM',
        availableBlood: {'B+': 'Có', 'AB+': 'Ít', 'O-': 'Có'},
        contact: '028-54321098',
        distance: '2.8 km',
        lastUpdated: '4 giờ trước',
      },
      {
        id: 5,
        name: 'Bệnh viện 115',
        address: '527 Sư Vạn Hạnh, Phường 12, Quận 10, TP.HCM',
        availableBlood: {'A+': 'Có', 'B+': 'Có', 'AB+': 'Có', 'O+': 'Có'},
        contact: '028-11511511',
        distance: '7.2 km',
        lastUpdated: '1 giờ trước',
      },
      {
        id: 6,
        name: 'Viện Huyết học và Truyền máu Trung ương',
        address: 'Phố Trần Thái Tông, Yên Hòa, Cầu Giấy, Hà Nội',
        availableBlood: {'A+': 'Có', 'B-': 'Ít', 'O+': 'Có'},
        contact: '024-38686008',
        distance: '1.5 km',
        lastUpdated: '5 giờ trước',
      },
      {
        id: 7,
        name: 'Bệnh viện Đa khoa Đà Nẵng',
        address: '124 Quang Trung, Thạch Thang, Hải Châu, Đà Nẵng',
        availableBlood: {'A+': 'Có', 'B+': 'Có', 'O+': 'Ít'},
        contact: '0236-3821118',
        distance: '0.7 km',
        lastUpdated: '15 phút trước',
      },
      {
        id: 8,
        name: 'Bệnh viện Huyết học - Truyền máu Cần Thơ',
        address: '131B Trần Hưng Đạo, An Phú, Ninh Kiều, Cần Thơ',
        availableBlood: {'AB+': 'Có', 'O-': 'Có', 'A-': 'Ít'},
        contact: '0292-3821035',
        distance: '4.0 km',
        lastUpdated: '6 giờ trước',
      },
      {
        id: 9,
        name: 'Bệnh viện Đa khoa Khánh Hòa',
        address: '19 Yersin, Lộc Thọ, Nha Trang, Khánh Hòa',
        availableBlood: {'A+': 'Có', 'B+': 'Có', 'O+': 'Có', 'AB+': 'Có'},
        contact: '0258-3822168',
        distance: '1.2 km',
        lastUpdated: '3 giờ trước',
      },
    ];

    // Lọc kết quả giả định theo nhóm máu và thành phố (để minh họa)
    const filteredResults = dummyResults.filter(result => {
      const matchesBloodType = bloodType ? (result.availableBlood[bloodType] === 'Có' || result.availableBlood[bloodType] === 'Ít') : true;
      
      // Chuẩn hóa tên thành phố trong địa chỉ để khớp với dropdown
      const normalizedAddress = result.address.toLowerCase().replace('tp.hcm', 'hồ chí minh');
      const normalizedCity = city.toLowerCase();

      const matchesCity = city ? normalizedAddress.includes(normalizedCity) : true;
      return matchesBloodType && matchesCity;
    });

    setResults(filteredResults);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 4, color: 'primary.main' }}>
        Tìm kiếm máu
      </Typography>

      <Box component={Paper} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Nhóm máu</InputLabel>
              <Select
                value={bloodType}
                label="Nhóm máu"
                onChange={(e) => setBloodType(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {bloodTypes.map((type) => (
                  <MenuItem key={type} value={type}>{type}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth size="small">
              <InputLabel>Tỉnh/Thành phố</InputLabel>
              <Select
                value={city}
                label="Tỉnh/Thành phố"
                onChange={(e) => setCity(e.target.value)}
              >
                <MenuItem value="">Tất cả</MenuItem>
                {cities.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleSearch}
              sx={{ py: 1.5 }}
            >
              Tìm kiếm
            </Button>
          </Grid>
        </Grid>
      </Box>

      {results.length > 0 ? (
        <Stack spacing={3}>
          {results.map((result) => (
            <Card key={result.id} elevation={3} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold" color="primary.main" gutterBottom>
                  {result.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">{result.address}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Bloodtype color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="text.secondary">Tồn kho: </Typography>
                  {Object.entries(result.availableBlood).map(([type, status]) => (
                    <Chip 
                      key={type} 
                      label={`${type}: ${status}`} 
                      size="small" 
                      color={status === 'Có' ? 'success' : (status === 'Ít' ? 'warning' : 'default')}
                      sx={{ ml: 1 }}
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Cập nhật:</Typography>
                  <Typography variant="body2" fontWeight="bold">{result.lastUpdated}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Liên hệ:</Typography>
                  <Typography variant="body2" fontWeight="bold">{result.contact}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Khoảng cách:</Typography>
                  <Typography variant="body2" fontWeight="bold">{result.distance}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy kết quả nào. Hãy thử tìm kiếm với các tiêu chí khác.
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default BloodSearch; 
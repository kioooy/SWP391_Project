import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Paper,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import axios from 'axios';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS = [
  {
    value: 'Whole Blood',
    label: 'Truyền toàn phần (Nhóm máu)',
    desc: 'Truyền máu toàn phần là truyền cả máu nguyên vẹn, thường dùng trong các trường hợp mất máu cấp tính.',
  },
  {
    value: 'Red Blood Cells',
    label: 'Hồng cầu',
    desc: 'Truyền hồng cầu giúp tăng khả năng vận chuyển oxy, thường dùng cho bệnh nhân thiếu máu.',
  },
  {
    value: 'Plasma',
    label: 'Huyết tương',
    desc: 'Truyền huyết tương cung cấp các yếu tố đông máu, dùng cho bệnh nhân rối loạn đông máu hoặc mất huyết tương.',
  },
  {
    value: 'Platelets',
    label: 'Tiểu cầu',
    desc: 'Truyền tiểu cầu giúp kiểm soát chảy máu, thường dùng cho bệnh nhân giảm tiểu cầu.',
  },
];

const SEARCH_MODES = [
  { value: 'compatibility', label: 'Tra cứu nhóm máu tương thích' },
  { value: 'available', label: 'Tra cứu đơn vị máu có sẵn' },
];

const BloodSearch = () => {
  const [recipientBloodType, setRecipientBloodType] = useState('A+');
  const [component, setComponent] = useState('Whole Blood');
  const [searchMode, setSearchMode] = useState('compatibility'); // Thêm state cho chế độ tra cứu
  const [result, setResult] = useState([]); // Kết quả nhóm máu tương thích
  const [availableUnits, setAvailableUnits] = useState([]); // Kết quả đơn vị máu có sẵn
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError('');
    setResult([]);
    setAvailableUnits([]);
    setLoading(true);

    try {
      let res;
      const encodedBloodType = encodeURIComponent(recipientBloodType);
      const encodedComponent = encodeURIComponent(component);

      if (searchMode === 'compatibility') {
        // Tra cứu nhóm máu tương thích
        if (component === 'Whole Blood') {
          res = await axios.get(`/api/BloodCompatibility/whole-blood?recipientBloodType=${encodedBloodType}`);
        } else {
          res = await axios.get(
            `/api/BloodCompatibility/component?nhomMauNguoiNhan=${encodedBloodType}&thanhPhan=${encodedComponent}`
          );
        }
        const data = res.data;
        const compatible = data.compatibleBloodTypes || data.CompatibleBloodTypes || [];
        setResult(compatible);
      } else {
        // Tra cứu đơn vị máu có sẵn
        res = await axios.get(
          `/api/BloodCompatibility/available?recipientBloodType=${encodedBloodType}&component=${encodedComponent}`
        );
        setAvailableUnits(res.data); // Lưu kết quả vào availableUnits
      }
    } catch (err) {
      setError(
        err.response?.data || 'Không tìm thấy dữ liệu phù hợp hoặc lỗi kết nối API.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedComponent = COMPONENTS.find(c => c.value === component);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Tra cứu nhóm máu và đơn vị máu
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Chế độ tra cứu</InputLabel>
            <Select
              value={searchMode}
              label="Chế độ tra cứu"
              onChange={e => setSearchMode(e.target.value)}
            >
              {SEARCH_MODES.map(mode => (
                <MenuItem key={mode.value} value={mode.value}>
                  {mode.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Nhóm máu cần nhận</InputLabel>
            <Select
              value={recipientBloodType}
              label="Nhóm máu cần nhận"
              onChange={e => setRecipientBloodType(e.target.value)}
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

          {selectedComponent && (
            <Alert severity="info" sx={{ fontSize: 15 }}>
              <b>Giải thích:</b> {selectedComponent.desc}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            onClick={handleSearch}
            disabled={loading}
          >
            {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </Button>
        </Box>
      </Paper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {result.length > 0 && searchMode === 'compatibility' && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Các nhóm máu phù hợp để hiến:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Danh sách dưới đây là các nhóm máu có thể truyền an toàn cho người nhận{' '}
            <b>{recipientBloodType}</b> với loại truyền{' '}
            <b>{selectedComponent?.label}</b>.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {result.map(type => (
              <Chip
                key={type}
                label={type}
                color="success"
                size="medium"
                sx={{ fontSize: 16 }}
              />
            ))}
          </Box>
        </Paper>
      )}

      {availableUnits.length > 0 && searchMode === 'available' && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Các đơn vị máu có sẵn:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Danh sách dưới đây là các đơn vị máu có sẵn trong kho cho người nhận{' '}
            <b>{recipientBloodType}</b> với loại truyền{' '}
            <b>{selectedComponent?.label}</b>.
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nhóm máu</TableCell>
                  <TableCell>Số lượng đơn vị</TableCell>
                  <TableCell>Tổng thể tích (ml)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {availableUnits.map(unit => (
                  <TableRow key={unit.bloodType}>
                    <TableCell>{unit.bloodType}</TableCell>
                    <TableCell>{unit.units}</TableCell>
                    <TableCell>{unit.totalVolume}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Container>
  );
};

export default BloodSearch;
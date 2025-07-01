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
  Alert,
} from '@mui/material';
import { Search as SearchIcon, LocationOn, Bloodtype } from '@mui/icons-material';
import axios from 'axios';

const BLOOD_TYPES = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
const COMPONENTS = [
  { value: 'whole-blood', label: 'Truyền toàn phần (Nhóm máu)', desc: 'Truyền máu toàn phần là truyền cả máu nguyên vẹn, thường dùng trong các trường hợp mất máu cấp tính.' },
  { value: 'red-cell', label: 'Hồng cầu', desc: 'Truyền hồng cầu giúp tăng khả năng vận chuyển oxy, thường dùng cho bệnh nhân thiếu máu.' },
  { value: 'plasma', label: 'Huyết tương', desc: 'Truyền huyết tương cung cấp các yếu tố đông máu, dùng cho bệnh nhân rối loạn đông máu hoặc mất huyết tương.' },
  { value: 'platelet', label: 'Tiểu cầu', desc: 'Truyền tiểu cầu giúp kiểm soát chảy máu, thường dùng cho bệnh nhân giảm tiểu cầu.' },
];

const BloodSearch = () => {
  const [recipientBloodType, setRecipientBloodType] = useState('A+');
  const [component, setComponent] = useState('whole-blood');
  const [result, setResult] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setError('');
    setResult([]);
    setLoading(true);
    try {
      let res;
      if (component === 'whole-blood') {
        res = await axios.get(`/api/BloodCompatibility/whole-blood?recipientBloodType=${recipientBloodType}`);
      } else {
        res = await axios.get(`/api/BloodCompatibility/component?recipientBloodType=${recipientBloodType}&component=${component}`);
      }
      setResult(res.data.CompatibleBloodTypes || []);
    } catch (err) {
      setError('Không tìm thấy dữ liệu phù hợp hoặc lỗi kết nối API.');
    } finally {
      setLoading(false);
    }
  };

  const selectedComponent = COMPONENTS.find(c => c.value === component);

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Tra cứu nhóm máu phù hợp để truyền máu
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
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
          <Button variant="contained" color="primary" onClick={handleSearch} disabled={loading}>
            {loading ? 'Đang tra cứu...' : 'Tra cứu'}
          </Button>
        </Box>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {result.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Các nhóm máu phù hợp để hiến:
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Danh sách dưới đây là các nhóm máu có thể truyền an toàn cho người nhận có nhóm máu <b>{recipientBloodType}</b> với loại truyền <b>{selectedComponent?.label}</b>.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {result.map(type => (
              <Chip key={type} label={type} color="success" size="large" sx={{ fontSize: 18 }} />
            ))}
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default BloodSearch; 
import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Chip,
  Stack,
  Avatar,
  IconButton,
  Alert,
} from "@mui/material";
import {
  LocationOn,
  Bloodtype,
  Phone,
  Email,
  Directions,
  FilterList,
  Clear,
} from "@mui/icons-material";
import { useSelector } from 'react-redux';

const SearchByDistance = () => {
  const [searchType, setSearchType] = useState("donor");
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [radius, setRadius] = useState(10000); // mét
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user: currentUser, isAuthenticated } = useSelector(state => state.auth);
  const [hospitalName, setHospitalName] = useState('');

  // Tự động lấy tọa độ bệnh viện nếu Staff/Admin
  useEffect(() => {
    if (currentUser?.role === 'Staff' || currentUser?.role === 'Admin') {
      (async () => {
        try {
          const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
          const token = localStorage.getItem('token');
          const res = await fetch(`${apiUrl}/BloodDistanceSearch/hospitals`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!res.ok) throw new Error('Không thể lấy thông tin bệnh viện');
          const [h] = await res.json();
          console.log("Dữ liệu bệnh viện từ API:", h); // Debug: Kiểm tra đối tượng h
          if (h) {
            console.log("Tên bệnh viện:", h.name); // Debug: Kiểm tra h.name
            console.log("Latitude:", h.latitude); // Debug: Kiểm tra h.latitude
            console.log("Longitude:", h.longitude); // Debug: Kiểm tra h.longitude
            setLatitude(h.latitude);
            setLongitude(h.longitude);
            setHospitalName(h.name);
          }
        } catch (err) {
          console.error(err);
        }
      })();
    }
  }, [currentUser]);

  // Lấy vị trí hiện tại
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        () => {
          setError("Không thể lấy vị trí hiện tại!");
        }
      );
    } else {
      setError("Trình duyệt không hỗ trợ lấy vị trí!");
    }
  };

  // Gửi request tìm kiếm
  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
      const token = localStorage.getItem('token');
      let url = '';
      const radiusInMeters = radius * 1000;
      if (searchType === 'donor') {
        url = `${apiUrl}/BloodDistanceSearch/donors-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusInMeters}`;
      } else {
        url = `${apiUrl}/BloodDistanceSearch/recipients-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusInMeters}`;
      }
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError('Không thể lấy dữ liệu từ server.');
    } finally {
      setLoading(false);
    }
  };

  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("");
  const [bloodCategory, setBloodCategory] = useState("");
  const [province, setProvince] = useState("");
  const [timeNeeded, setTimeNeeded] = useState("");
  const [availability, setAvailability] = useState("");

  // Hàm lấy vị trí hiện tại và gọi API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setResults([]);
      try {
        // Lấy vị trí hiện tại
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });
        const { latitude, longitude } = position.coords;
        const radius = 10000; // 10km mặc định, có thể cho user chọn
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';
        const token = localStorage.getItem('token');
        let url = '';
        if (searchType === 'donor') {
          url = `${apiUrl}/BloodDistanceSearch/donors-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
        } else {
          url = `${apiUrl}/BloodDistanceSearch/recipients-nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`;
        }
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không thể lấy dữ liệu từ server');
        const data = await res.json();
        // Map dữ liệu về format cần thiết (giả lập các trường cần thiết)
        let mapped = data.map((item, idx) => ({
          id: item.UserId || idx,
          name: item.FullName || item.Address || '-',
          bloodType: item.BloodTypeId || '-',
          distance: item.Location && item.Location.coordinates ? Number(item.Location.coordinates[0]).toFixed(2) : '-',
          location: item.Address || '-',
          phone: item.Phone || '-',
          email: item.Email || '-',
          avatar: item.FullName ? item.FullName[0] : '-',
          category: '-',
          availability: '-',
          type: searchType,
          timeAvailable: '-',
          province: '-',
        }));
        if (mapped.length === 0) {
          mapped = [{
            id: '-',
            name: '-',
            bloodType: '-',
            distance: '-',
            location: '-',
            phone: '-',
            email: '-',
            avatar: '-',
            category: '-',
            availability: '-',
            type: searchType,
            timeAvailable: '-',
            province: '-',
          }];
        }
        setResults(mapped);
      } catch (err) {
        setError('Không thể lấy vị trí hoặc dữ liệu từ server.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [searchType]);



  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodCategories = ["máu toàn phần", "tiểu cầu", "huyết tương"];
  const timeOptions = ["gấp", "trong ngày", "lịch hẹn cụ thể"];
  const availabilityOptions = ["Sẵn có", "Hiếm"];

  // Đã xoá toàn bộ mockData và dữ liệu mẫu

  // Hàm lọc dữ liệu
  const filteredResults = useMemo(() => {
    return results.filter((item) => {
      // Lọc theo nhóm máu
      if (bloodTypeNeeded && item.bloodType !== bloodTypeNeeded) return false;
      // Lọc theo loại máu
      if (bloodCategory && item.category !== bloodCategory) return false;

      // Lọc theo tỉnh/thành phố (tìm kiếm gần đúng)
      if (
        province &&
        !item.province.toLowerCase().includes(province.toLowerCase()) &&
        !item.location.toLowerCase().includes(province.toLowerCase())
      )
        return false;

      // Lọc theo thởi gian cần
      if (timeNeeded && item.timeAvailable !== timeNeeded) return false;

      // Lọc theo tình trạng sẵn có
      if (availability && item.availability !== availability) return false;

      return true;
    });
  }, [
    results,
    searchType,
    bloodTypeNeeded,
    bloodCategory,
    province,
    timeNeeded,
    availability,
  ]);

  // Hàm xóa tất cả bộ lọc
  const clearAllFilters = () => {
    setBloodTypeNeeded("");
    setBloodCategory("");
    setProvince("");
    setTimeNeeded("");
    setAvailability("");
  };

  // Đếm số bộ lọc đang được áp dụng
  const activeFiltersCount = [
    bloodTypeNeeded,
    bloodCategory,
    province,
    timeNeeded,
    availability,
  ].filter(Boolean).length;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: "bold", color: '#E53935' }}>
            Tìm kiếm theo khoảng cách
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loại tìm kiếm</InputLabel>
                <Select
                  value={searchType}
                  label="Loại tìm kiếm"
                  onChange={e => setSearchType(e.target.value)}
                >
                  <MenuItem value="donor">Tìm người hiến máu</MenuItem>
                  <MenuItem value="recipient">Tìm người nhận máu</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {(currentUser?.role === 'Staff' || currentUser?.role === 'Admin') && hospitalName ? (
              <Grid item xs={12}>
                <Typography>
                  Địa điểm: <b>{hospitalName}</b> ({latitude?.toFixed(6)}, {longitude?.toFixed(6)})
                </Typography>
              </Grid>
            ) : (
              <>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Vĩ độ (latitude)"
                    value={latitude}
                    onChange={e => setLatitude(e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Kinh độ (longitude)"
                    value={longitude}
                    onChange={e => setLongitude(e.target.value)}
                    fullWidth
                    type="number"
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                label="Bán kính tìm kiếm (km)"
                type="number"
                value={radius}
                onChange={e => setRadius(Number(e.target.value))}
                fullWidth
                inputProps={{ min: 0, max: 100, step: 0.1 }}
                helperText="Nhập số thập phân theo định dạng hệ thống, ví dụ: 0,5 hoặc 0.5 tuỳ máy."
              />
            </Grid>
            <Grid item xs={12}>
              {!(currentUser?.role === 'Staff' || currentUser?.role === 'Admin') && (
                <Button onClick={handleGetLocation} variant="outlined" sx={{ mr: 2 }}>
                  Lấy vị trí hiện tại
                </Button>
              )}
              <Button onClick={handleSearch} variant="contained">
                Tìm kiếm
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      {loading && <Typography align="center" sx={{ mt: 2 }}>Đang tải dữ liệu...</Typography>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {results.length > 0 ? (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Kết quả:</Typography>
            <Grid container spacing={2}>
              {filteredResults.map((item, idx) => (
                <Grid item xs={12} key={idx}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1"><b>UserId:</b> {item.userId}</Typography>
<Typography variant="body2"><b>Họ tên:</b> {item.fullName}</Typography>
<Typography variant="body2"><b>SĐT:</b> {item.phone}</Typography>
<Typography variant="body2"><b>Email:</b> {item.email}</Typography>
<Typography variant="body2"><b>Nhóm máu:</b> {item.bloodType}</Typography>
<Typography variant="body2"><b>Địa chỉ:</b> {item.address}</Typography>
<Typography variant="body2"><b>Cân nặng:</b> {item.weight}</Typography>
<Typography variant="body2"><b>Chiều cao:</b> {item.height}</Typography>
<Typography variant="body2"><b>Khoảng cách:</b> {item.distance < 1000 ? `${Math.round(item.distance)} mét` : `${(item.distance/1000).toFixed(2)} km`}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mt: 4 }}>
          <CardContent>
            <Typography align="center" color="text.secondary">
              Không tìm thấy kết quả phù hợp
            </Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default SearchByDistance;

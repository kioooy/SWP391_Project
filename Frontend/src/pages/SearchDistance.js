import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  CircularProgress, 
  Alert, 
  List, 
  ListItem, 
  ListItemText, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Slider, 
  Grid, 
  Card, 
  CardContent,
  Divider
} from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Fix cho marker icon bị mất trong production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api'; // Sử dụng biến môi trường

const SearchDistance = () => {

  const navigate = useNavigate();

  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [searchRadius, setSearchRadius] = useState(5); // Bán kính tìm kiếm mặc định 5km
  const [searchType, setSearchType] = useState('donors'); // 'donors' hoặc 'recipients'
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const { user, token: authToken } = useSelector((state) => state.auth);
  const userId = user?.userId; // Lấy userId từ Redux store

  useEffect(() => {
    const fetchUserLocationAndSearch = async () => {
      setLoading(true);
      setError(null);

      if (!navigator.geolocation) {
        setError('Trình duyệt của bạn không hỗ trợ Geolocation API.');
        setLoading(false);
        return;
      }

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });

        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        // 1. Cập nhật vị trí người dùng lên backend
        if (userId && authToken) {
          await fetch(`${API_BASE_URL}/User/${userId}/location`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authToken}`,
            },
            body: JSON.stringify({ latitude, longitude }),
          });
        } else {
            console.warn('UserId hoặc AuthToken chưa được thiết lập. Bỏ qua cập nhật vị trí.');
        }

        // 2. Không tìm kiếm người dùng gần đó trực tiếp cho Member
        // Việc tìm kiếm và điều phối sẽ do Staff/Admin thực hiện
        // Tuy nhiên, có thể gửi một tín hiệu hoặc thông báo rằng vị trí đã được cập nhật thành công.

      } catch (err) {
        console.error('Lỗi:', err);
        if (err.code) {
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    setError('Bạn đã từ chối cấp quyền truy cập vị trí. Vui lòng cho phép để sử dụng chức năng này.');
                    break;
                case err.POSITION_UNAVAILABLE:
                    setError('Thông tin vị trí không khả dụng.');
                    break;
                case err.TIMEOUT:
                    setError('Yêu cầu lấy vị trí đã hết thời gian.');
                    break;
                default:
                    setError('Đã xảy ra lỗi không xác định khi lấy vị trí.');
            }
        } else {
            setError(err.message || 'Đã xảy ra lỗi khi lấy vị trí hoặc tìm kiếm.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserLocationAndSearch();
  }, [userId, authToken]); // Re-run when userId or authToken changes

  // Hàm tìm kiếm người dùng gần đó
  const handleSearch = async () => {
    if (!userLocation) return;
    
    setIsSearching(true);
    try {
      const endpoint = searchType === 'donors' 
        ? 'BloodDistanceSearch/donors-nearby' 
        : 'BloodDistanceSearch/recipients-nearby';
      
      const response = await fetch(
        `${API_BASE_URL}/${endpoint}?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radius=${searchRadius * 1000}`, // Chuyển đổi km sang mét
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        }
      );
      
      if (!response.ok) throw new Error('Lỗi khi tải dữ liệu');
      
      let data = await response.json();
      console.log('Dữ liệu từ API:', data);
      
      // Lọc bỏ các mục có tên mẫu
      data = data.filter(item => {
        const fullName = item.fullName || '';
        return !['Nguyễn Văn A', 'Trần Thị B'].includes(fullName.trim());
      });
      
      // Chỉ lấy các trường cần thiết
      const cleanData = data.map(item => ({
        userId: item.userId || null,
        bloodTypeId: item.bloodTypeId || null,
        weight: item.weight || null,
        address: item.address || null,
        location: item.location || null,
        fullName: item.fullName || null
      }));
      
      console.log('Dữ liệu đã làm sạch:', cleanData);
      setSearchResults(cleanData);
    } catch (err) {
      console.error('Lỗi tìm kiếm:', err);
      setError('Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.');
    } finally {
      setIsSearching(false);
    }
  };

  // Kiểm tra xem người dùng có phải là nhân viên không
  const isStaff = user?.role?.toLowerCase() === 'staff' || user?.role?.toLowerCase() === 'admin';

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: '#E53935' }}>
        {isStaff ? 'Tìm kiếm theo khoảng cách' : 'Cập nhật vị trí của bạn'}
      </Typography>
      
      <Box sx={{ my: 3 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {!loading && !error && userLocation && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Vị trí hiện tại của bạn: {userLocation.latitude.toFixed(6)}, {userLocation.longitude.toFixed(6)}
          </Alert>
        )}

        {isStaff && userLocation && (
          <Card sx={{ mb: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>Bộ lọc tìm kiếm</Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Loại tìm kiếm</InputLabel>
                  <Select
                    value={searchType}
                    label="Loại tìm kiếm"
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <MenuItem value="donors">Người hiến máu</MenuItem>
                    <MenuItem value="recipients">Người cần máu</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={8}>
                <Box>
                  <Typography gutterBottom>Bán kính tìm kiếm: {searchRadius} km</Typography>
                  <Slider
                    value={searchRadius}
                    onChange={(_, value) => setSearchRadius(value)}
                    min={1}
                    max={50}
                    step={1}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} km`}
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Button 
                  variant="contained" 
                  onClick={handleSearch}
                  disabled={isSearching}
                  startIcon={isSearching ? <CircularProgress size={20} /> : null}
                >
                  {isSearching ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
                </Button>
              </Grid>
            </Grid>
          </Card>
        )}

        {isStaff && searchResults.length > 0 && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Kết quả tìm kiếm ({searchResults.length} kết quả)
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <List sx={{ maxHeight: 400, overflow: 'auto' }}>
                    {searchResults.map((user, index) => (
                      <Card key={index} variant="outlined" sx={{ mb: 1 }}>
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="subtitle1">
                            {searchType === 'donors' ? 'Người hiến máu' : 'Người cần máu'} #{user.userId || '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Nhóm máu: {user.bloodTypeId || '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Cân nặng: {user.weight ? `${user.weight} kg` : '-'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Địa chỉ: {user.address || '-'}
                          </Typography>
                        </CardContent>
                      </Card>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Box sx={{ height: 400, borderRadius: 1, overflow: 'hidden' }}>
                    <MapContainer 
                      center={[userLocation.latitude, userLocation.longitude]} 
                      zoom={13} 
                      style={{ height: '100%', width: '100%' }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <Circle
                        center={[userLocation.latitude, userLocation.longitude]}
                        radius={searchRadius * 1000} // Chuyển đổi km sang mét
                        color="blue"
                        fillColor="blue"
                        fillOpacity={0.2}
                      />
                      <Marker position={[userLocation.latitude, userLocation.longitude]}>
                        <Popup>Vị trí của bạn</Popup>
                      </Marker>
                      {searchResults.map((user, index) => (
                        user.location?.coordinates && (
                          <Marker 
                            key={index} 
                            position={[user.location.coordinates[1], user.location.coordinates[0]]}
                          >
                            <Popup>
                              {searchType === 'donors' ? 'Người hiến máu' : 'Người cần máu'} #{user.userId || '-'}
                              <br />
                              Nhóm máu: {user.bloodTypeId || '-'}
                            </Popup>
                          </Marker>
                        )
                      ))}
                    </MapContainer>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}

        {!isStaff && !loading && !error && userLocation && (
          <Alert severity="success" sx={{ my: 2 }}>
            Vị trí của bạn đã được cập nhật thành công. Cơ sở y tế sẽ sử dụng thông tin này để điều phối khi cần.
          </Alert>
        )}

        {!loading && !error && !userLocation && user?.role?.toLowerCase() === 'member' && (
          <Alert severity="warning" sx={{ my: 2 }}>
            Để cơ sở y tế có thể điều phối bạn khi cần máu hoặc để bạn tìm kiếm các điểm hiến máu gần nhất, vui lòng cập nhật vị trí của bạn.
            <Button
              variant="outlined"
              color="warning"
              sx={{ ml: 2 }}
              onClick={() => navigate('/user-profile')}
            >
              Cập nhật vị trí tại Hồ sơ
            </Button>
          </Alert>
        )}
        
        {!loading && !error && !userLocation && user?.role?.toLowerCase() !== 'member' && (
          <Alert severity="warning" sx={{ my: 2 }}>
            Vui lòng cho phép truy cập vị trí để sử dụng chức năng này.
          </Alert>
        )}
      </Box>
    </Container>
  );
};

export default SearchDistance;

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, CircularProgress, Alert, List, ListItem, ListItemText, Paper } from '@mui/material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5250/api'; // Đồng bộ với các API khác

const SearchDistance = () => {
  const navigate = useNavigate();
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [searchRadius, setSearchRadius] = useState(10); // Bán kính tìm kiếm mặc định 10km

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

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Cập nhật vị trí của bạn
      </Typography>
      <Box sx={{ my: 3 }}>
        {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress /></Box>}
        {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}

        {!loading && !error && userLocation && (
          <Typography variant="body1" gutterBottom>
            Vị trí hiện tại của bạn: Vĩ độ {userLocation.latitude}, Kinh độ {userLocation.longitude}
          </Typography>
        )}

        {!loading && !error && userLocation && (
            <Alert severity="success" sx={{ my: 2 }}>Vị trí của bạn đã được cập nhật thành công. Cơ sở y tế sẽ sử dụng thông tin này để điều phối khi cần.</Alert>
        )}

        {!loading && !error && !userLocation && user?.role.toLowerCase() === 'member' && (
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
        {!loading && !error && !userLocation && user?.role.toLowerCase() !== 'member' && (
            <Alert severity="warning" sx={{ my: 2 }}>Vui lòng cho phép truy cập vị trí để sử dụng chức năng này.</Alert>
        )}
      </Box>
    </Container>
  );
};

export default SearchDistance;

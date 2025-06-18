import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button, TextField, CircularProgress, Alert, Paper } from '@mui/material';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useSelector } from 'react-redux';

// Fix icon leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow });
L.Marker.prototype.options.icon = DefaultIcon;

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5250/api';

function LocationPicker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const HospitalLocationEdit = () => {
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");
  const { user, token } = useSelector((state) => state.auth);

  // Hàm lấy tọa độ từ địa chỉ sử dụng Nominatim
  const handleGeocode = async () => {
    if (!address) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setPosition([lat, lon]);
        setSuccess("Đã lấy tọa độ thành công!");
      } else {
        setError("Không tìm thấy địa chỉ này!");
      }
    } catch (err) {
      setError("Có lỗi khi lấy tọa độ!");
    }
  };

  useEffect(() => {
    const fetchHospital = async () => {
      setLoading(true);
      setError(null);
      setSuccess(null);
      try {
        const res = await fetch(`${API_BASE_URL}/Hospital`);
        if (!res.ok) throw new Error('Không lấy được thông tin bệnh viện');
        const data = await res.json();
        setHospital(data);
        if (data.Latitude && data.Longitude) {
          setPosition([data.Latitude, data.Longitude]);
        } else {
          setPosition(null);
        }
      } catch (err) {
        setError(err.message || 'Lỗi khi tải dữ liệu bệnh viện');
      } finally {
        setLoading(false);
      }
    };
    fetchHospital();
  }, []);

  const handleSave = async () => {
    if (!position || !hospital) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${API_BASE_URL}/Hospital/1/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ Latitude: position[0], Longitude: position[1] })
      });
      if (!res.ok) throw new Error('Cập nhật vị trí thất bại');
      setSuccess('Cập nhật vị trí thành công!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Cập nhật vị trí cơ sở y tế</Typography>
        {hospital && (
          <Box sx={{ mb: 2 }}>
            <Typography><b>Tên:</b> {hospital.Name}</Typography>
            <Typography><b>Địa chỉ:</b> {hospital.Address}</Typography>
          </Box>
        )}
        <Typography variant="h6" gutterBottom>
          Cập nhật vị trí cơ sở y tế
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <b>Hướng dẫn:</b><br/>
          1. Bạn có thể <b>nhấn trực tiếp lên bản đồ</b> để chọn vị trí bệnh viện.<br/>
          2. Hoặc <b>nhập trực tiếp tọa độ Latitude/Longitude</b> vào ô bên dưới bản đồ.<br/>
          3. Hoặc <b>nhập địa chỉ và nhấn "Lấy tọa độ từ địa chỉ"</b> để tự động điền.
        </Alert>

        <TextField
          label="Địa chỉ (tìm kiếm tọa độ)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          fullWidth
          margin="normal"
          placeholder="Nhập địa chỉ, ví dụ: 118 Hồng Bàng, Quận 5, Hồ Chí Minh"
        />
        <Button onClick={async () => {
          setError(null);
          setSuccess(null);
          const TOMTOM_API_KEY = "1LSXz2btWI6aUxS9BU8EyOjrhZew4vUa";
          if (!address) return setError("Vui lòng nhập địa chỉ!");
          try {
            const url = `https://api.tomtom.com/search/2/geocode/${encodeURIComponent(address)}.json?key=${TOMTOM_API_KEY}`;
            const res = await fetch(url);
            const data = await res.json();
            if (data.results && data.results.length > 0) {
              const lat = data.results[0].position.lat;
              const lng = data.results[0].position.lon;
              setPosition([lat, lng]);
              setSuccess("Đã lấy tọa độ thành công!");
            } else {
              setError("Không tìm thấy địa chỉ này!");
            }
          } catch (err) {
            setError("Có lỗi khi lấy tọa độ!");
          }
        }} variant="outlined" sx={{ mb: 2 }}>
          Lấy tọa độ từ địa chỉ
        </Button>

        <Box sx={{ mb: 2 }}>
          <MapContainer
            center={position || [10.762622, 106.660172]}
            zoom={16}
            style={{ height: 250, width: "100%", marginBottom: 16 }}
          >
            <TileLayer
              url={`https://api.tomtom.com/map/1/tile/basic/main/{z}/{x}/{y}.png?key=1LSXz2btWI6aUxS9BU8EyOjrhZew4vUa`}
              attribution='&copy; <a href="https://developer.tomtom.com/">TomTom</a> contributors'
            />
            {position && <LocationPicker position={position} setPosition={setPosition} />}
          </MapContainer>
        </Box>
        <TextField
          label="Latitude"
          value={position ? position[0] : ''}
          onChange={e => setPosition([parseFloat(e.target.value), position ? position[1] : 0])}
          type="number"
          fullWidth
          sx={{ mb: 2 }}
        />
        <TextField
          label="Longitude"
          value={position ? position[1] : ''}
          onChange={e => setPosition([position ? position[0] : 0, parseFloat(e.target.value)])}
          type="number"
          fullWidth
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving || !position}
          fullWidth
        >
          {saving ? 'Đang lưu...' : 'Lưu vị trí'}
        </Button>
        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
      </Paper>
    </Container>
  );
};

export default HospitalLocationEdit;

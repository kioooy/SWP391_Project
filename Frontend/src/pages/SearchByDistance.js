import React, { useState, useMemo } from "react";
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

const SearchByDistance = () => {
  const [bloodTypeNeeded, setBloodTypeNeeded] = useState("");
  const [bloodCategory, setBloodCategory] = useState("");
  const [province, setProvince] = useState("");
  const [timeNeeded, setTimeNeeded] = useState("");
  const [availability, setAvailability] = useState("");
  const [searchType, setSearchType] = useState("donor");

  // Dữ liệu mẫu mở rộng
  const mockData = [
    {
      id: 1,
      name: "Nguyễn Văn A",
      bloodType: "A+",
      distance: 2.5,
      lastDonation: "2024-01-15",
      location: "Quận 1, TP.HCM",
      phone: "0123456789",
      email: "nguyenvana@email.com",
      avatar: "A",
      category: "máu toàn phần",
      availability: "Sẵn có",
      type: "donor",
      timeAvailable: "trong ngày",
      province: "TP.HCM",
    },
    {
      id: 2,
      name: "Trần Thị B",
      bloodType: "O+",
      distance: 3.8,
      lastDonation: "2024-02-20",
      location: "Quận 3, TP.HCM",
      phone: "0987654321",
      email: "tranthib@email.com",
      avatar: "B",
      category: "tiểu cầu",
      availability: "Hiếm",
      type: "donor",
      timeAvailable: "gấp",
      province: "TP.HCM",
    },
    {
      id: 3,
      name: "Bệnh viện Chợ Rẫy",
      bloodType: "B+",
      distance: 1.2,
      urgency: "Khẩn cấp",
      location: "Quận 5, TP.HCM",
      phone: "02838554137",
      email: "contact@choray.vn",
      avatar: "CR",
      category: "huyết tương",
      availability: "Sẵn có",
      type: "receiver",
      timeAvailable: "gấp",
      province: "TP.HCM",
    },
    {
      id: 4,
      name: "Lê Văn C",
      bloodType: "AB+",
      distance: 5.2,
      lastDonation: "2024-03-10",
      location: "Quận 7, TP.HCM",
      phone: "0912345678",
      email: "levanc@email.com",
      avatar: "C",
      category: "máu toàn phần",
      availability: "Sẵn có",
      type: "donor",
      timeAvailable: "lịch hẹn cụ thể",
      province: "TP.HCM",
    },
    {
      id: 5,
      name: "Bệnh viện Bạch Mai",
      bloodType: "O-",
      distance: 8.5,
      urgency: "Bình thường",
      location: "Đống Đa, Hà Nội",
      phone: "02438691155",
      email: "contact@bachmai.vn",
      avatar: "BM",
      category: "tiểu cầu",
      availability: "Hiếm",
      type: "receiver",
      timeAvailable: "trong ngày",
      province: "Hà Nội",
    },
    {
      id: 6,
      name: "Phạm Thị D",
      bloodType: "A-",
      distance: 4.1,
      lastDonation: "2024-01-25",
      location: "Hai Bà Trưng, Hà Nội",
      phone: "0934567890",
      email: "phamthid@email.com",
      avatar: "D",
      category: "huyết tương",
      availability: "Hiếm",
      type: "donor",
      timeAvailable: "gấp",
      province: "Hà Nội",
    },
  ];

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const bloodCategories = ["máu toàn phần", "tiểu cầu", "huyết tương"];
  const timeOptions = ["gấp", "trong ngày", "lịch hẹn cụ thể"];
  const availabilityOptions = ["Sẵn có", "Hiếm"];

  // Hàm lọc dữ liệu
  const filteredResults = useMemo(() => {
    return mockData.filter((item) => {
      // Lọc theo loại tìm kiếm (donor/receiver)
      if (item.type !== searchType) return false;

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

      // Lọc theo thời gian cần
      if (timeNeeded && item.timeAvailable !== timeNeeded) return false;

      // Lọc theo tình trạng sẵn có
      if (availability && item.availability !== availability) return false;

      return true;
    });
  }, [
    mockData,
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
        sx={{ mb: 4, color: "primary.main" }}
      >
        Thanh tìm kiếm bộ lọc chính
      </Typography>

      {/* Bộ lọc tìm kiếm chính */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Loại tìm kiếm */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại tìm kiếm</InputLabel>
                <Select
                  value={searchType}
                  label="Loại tìm kiếm"
                  onChange={(e) => setSearchType(e.target.value)}
                >
                  <MenuItem value="donor">Tìm người hiến máu</MenuItem>
                  <MenuItem value="receiver">Tìm người cần máu</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Nhóm máu cần tìm */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Nhóm máu cần tìm</InputLabel>
                <Select
                  value={bloodTypeNeeded}
                  label="Nhóm máu cần tìm"
                  onChange={(e) => setBloodTypeNeeded(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {bloodTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Loại máu cần */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Loại máu cần</InputLabel>
                <Select
                  value={bloodCategory}
                  label="Loại máu cần"
                  onChange={(e) => setBloodCategory(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {bloodCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tỉnh/thành phố hoặc bệnh viện cụ thể */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Tỉnh/thành phố hoặc bệnh viện cụ thể"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="Nhập tên tỉnh/thành phố hoặc bệnh viện..."
                variant="outlined"
              />
            </Grid>

            {/* Thời gian cần */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Thời gian cần</InputLabel>
                <Select
                  value={timeNeeded}
                  label="Thời gian cần"
                  onChange={(e) => setTimeNeeded(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {timeOptions.map((time) => (
                    <MenuItem key={time} value={time}>
                      {time}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Tình trạng sẵn có hoặc hiếm */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Tình trạng sẵn có hoặc hiếm</InputLabel>
                <Select
                  value={availability}
                  label="Tình trạng sẵn có hoặc hiếm"
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <MenuItem value="">Tất cả</MenuItem>
                  {availabilityOptions.map((avail) => (
                    <MenuItem key={avail} value={avail}>
                      {avail}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Nút điều khiển */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<FilterList />}
                  size="large"
                  sx={{ flex: 1 }}
                >
                  Áp dụng bộ lọc ({activeFiltersCount})
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Clear />}
                  size="large"
                  onClick={clearAllFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Xóa tất cả
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Thông tin bộ lọc hiện tại */}
      {activeFiltersCount > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Đang áp dụng {activeFiltersCount} bộ lọc:
            {bloodTypeNeeded && ` Nhóm máu: ${bloodTypeNeeded}`}
            {bloodCategory && ` | Loại máu: ${bloodCategory}`}
            {province && ` | Tỉnh/TP: ${province}`}
            {timeNeeded && ` | Thời gian: ${timeNeeded}`}
            {availability && ` | Tình trạng: ${availability}`}
          </Typography>
        </Alert>
      )}

      {/* Kết quả tìm kiếm */}
      <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Kết quả tìm kiếm ({filteredResults.length} kết quả)
      </Typography>

      {filteredResults.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy kết quả phù hợp
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Hãy thử điều chỉnh bộ lọc để tìm kiếm với tiêu chí khác
            </Typography>
            <Button variant="outlined" onClick={clearAllFilters}>
              Xóa tất cả bộ lọc
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredResults.map((item) => (
            <Grid item xs={12} key={item.id}>
              <Card>
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar
                        sx={{
                          bgcolor:
                            item.availability === "Hiếm"
                              ? "error.main"
                              : "primary.main",
                          width: 56,
                          height: 56,
                        }}
                      >
                        {item.avatar}
                      </Avatar>
                    </Grid>

                    <Grid item xs>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mb: 1, flexWrap: "wrap", gap: 1 }}
                      >
                        <Chip
                          icon={<Bloodtype />}
                          label={`Nhóm máu ${item.bloodType}`}
                          color="error"
                          size="small"
                        />
                        <Chip label={item.category} color="info" size="small" />
                        <Chip
                          icon={<LocationOn />}
                          label={`${item.distance} km`}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={item.availability}
                          color={
                            item.availability === "Hiếm" ? "error" : "success"
                          }
                          size="small"
                        />
                        <Chip
                          label={item.timeAvailable}
                          color="warning"
                          size="small"
                        />
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        <LocationOn
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {item.location}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        <Phone
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {item.phone}
                      </Typography>

                      <Typography variant="body2" color="text.secondary">
                        <Email
                          sx={{
                            fontSize: 16,
                            verticalAlign: "middle",
                            mr: 0.5,
                          }}
                        />
                        {item.email}
                      </Typography>

                      {item.lastDonation && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          Lần hiến máu gần nhất: {item.lastDonation}
                        </Typography>
                      )}
                    </Grid>

                    <Grid item>
                      <IconButton color="primary" size="large">
                        <Directions />
                      </IconButton>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SearchByDistance;

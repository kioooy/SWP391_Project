import React from "react";
import {
  Outlet,
  Link as RouterLink,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Stack,
  Menu,
  MenuItem,
  Snackbar,
  Alert,

} from "@mui/material";
import axios from 'axios';
import { styled } from "@mui/material/styles";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import NewsIcon from "@mui/icons-material/Article";
import ContactIcon from "@mui/icons-material/ContactMail";
import { logout } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSlice";
import Footer from "../components/Footer";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";

// Hàm tính khoảng cách Haversine giữa hai điểm (latitude, longitude)
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // metres
  const φ1 = lat1 * Math.PI / 180; // φ, λ in radians
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const d = R * c; // in metres
  return d;
}

const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
}));

const ContentContainer = styled(Container)(({ theme }) => ({
  flex: 1,
  padding: theme.spacing(3),
}));

const StyledLink = styled(RouterLink)(({ theme }) => ({
  color: "inherit",
  textDecoration: "none",
  "&:hover": {
    textDecoration: "none",
  },
}));

const NavButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isActive",
})(({ theme, isActive }) => ({
  color: "inherit",
  textTransform: "none",
  minWidth: "auto",
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(1),
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  ...(isActive && {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    fontWeight: "bold",
  }),
}));

const MainLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [openLocationSnackbar, setOpenLocationSnackbar] = useState(false);
  const [locationSnackbarMessage, setLocationSnackbarMessage] = useState('');

  const { user: currentUser, isAuthenticated, token: authToken } = useSelector((state) => state.auth);

  useEffect(() => {
    if (currentUser && currentUser.role === 'Member') {
      const hasShownSnackbar = sessionStorage.getItem('hasShownLocationSnackbar');

      // Nếu người dùng chưa có vị trí hoặc Snackbar chưa được hiển thị trong phiên này
      if ((!currentUser.latitude || !currentUser.longitude) && !hasShownSnackbar) {
        setLocationSnackbarMessage('Vui lòng cập nhật vị trí của bạn để hệ thống có thể tìm kiếm và kết nối bạn với người hiến/nhận máu phù hợp.');
        setOpenLocationSnackbar(true);
        sessionStorage.setItem('hasShownLocationSnackbar', 'true');
      } else if (currentUser.latitude && currentUser.longitude) {
        // Nếu người dùng đã có vị trí, kiểm tra xem vị trí có lỗi thói không
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude: currentLat, longitude: currentLon } = position.coords;
              const storedLat = currentUser.latitude;
              const storedLon = currentUser.longitude;

              const distance = haversineDistance(storedLat, storedLon, currentLat, currentLon);
              const THRESHOLD = 500; // 500 meters

              if (distance > THRESHOLD && !hasShownSnackbar) {
                setLocationSnackbarMessage('Vị trí đã lưu của bạn có vẻ đã lỗi thói. Vui lòng cập nhật vị trí hiện tại của bạn.');
                setOpenLocationSnackbar(true);
                sessionStorage.setItem('hasShownLocationSnackbar', 'true');
              }
            },
            (error) => {
              console.error("Lỗi khi lấy vị trí hiện tại: ", error);
              // Có thể hiển thị thông báo lỗi cho người dùng nếu cần
            },
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          );
        }
      }
    } else if (!currentUser) {
      // Clear snackbar state if user logs out
      sessionStorage.removeItem('hasShownLocationSnackbar');
      setOpenLocationSnackbar(false);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.removeItem("isTestUser");
    localStorage.removeItem("isStaff");
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleStaffLogin = () => {
    localStorage.setItem("isStaff", "true");
    localStorage.setItem("isTestUser", "true");
    navigate("/");
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutAll = () => {
    localStorage.removeItem("isTestUser");
    localStorage.removeItem("isStaff");
    handleClose();
    handleLogout();
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  // Kiểm tra trạng thái đăng nhập test user và staff
  const isTestUser = localStorage.getItem("isTestUser") === "true";
  const isStaff = localStorage.getItem("isStaff") === "true";

  let menuItems = [
    { path: "/", label: "Trang Chủ", icon: <HomeIcon /> },
    { path: "/faq", label: "Hỏi & Đáp", icon: <QuestionAnswerIcon /> },
    { path: "/news", label: "Tin Tức", icon: <NewsIcon /> },
    { path: "/booking", label: "Đặt Lịch", icon: <ContactIcon /> },
    { path: "/certificate", label: "Chứng Chỉ", icon: <ContactIcon /> },
    { path: "/search-distance", label: "Tìm Kiếm", icon: <SearchIcon /> },
    { path: "/emergency-request", label: "Yêu Cầu Khẩn", icon: <LocalHospitalIcon /> },
  ];

  // Menu items cho người dùng đã đăng nhập

  if (isAuthenticated || isTestUser) {
    if (isStaff) {
      // Menu items cho nhân viên
      menuItems = [
        { path: "/", label: "Trang Chủ", icon: <HomeIcon /> },
        { path: "/transfusion-request", label: "Yêu Cầu Hiến Máu", icon: <HistoryIcon /> },
      ];
    } else {
      // Menu items cho người dùng thường và tài khoản test
      menuItems = [
        { path: "/", label: "Trang Chủ", icon: <HomeIcon /> },
        { path: "/faq", label: "Hỏi & Đáp", icon: <QuestionAnswerIcon /> },
        { path: "/news", label: "Tin Tức", icon: <NewsIcon /> },
        { path: "/booking", label: "Đặt Lịch", icon: <ContactIcon /> },
        { path: "/certificate", label: "Chứng Chỉ", icon: <ContactIcon /> },
        { path: "/search-distance", label: "Tìm Kiếm", icon: <SearchIcon /> },
        { path: "/emergency-request", label: "Yêu Cầu Khẩn", icon: <LocalHospitalIcon /> },
        { path: "/user-profile", label: "Hồ Sơ", icon: <PersonIcon /> },
        { path: "/history", label: "Lịch Sử Đặt Hẹn", icon: <PersonIcon /> },
      ];
    }
  }

  return (
    <MainContainer>
      {/* PHẦN TRÊN: logo, ngôn ngữ, đăng nhập */}
      <Box sx={{ background: "#fff", py: 1 }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ width: 80 }} />
            {/* Logo */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src="/images/logo.png"
                alt="logo"
                style={{ height: 40, marginRight: 8 }}
              />
              <Typography
                variant="h5"
                fontWeight="bold"
                color="primary.main"
                sx={{ letterSpacing: 2 }}
              >
                Hệ Thống Hỗ Trợ Hiến Máu
              </Typography>
            </Box>
            {/* Đăng nhập/Đăng ký hoặc Profile */}
            <Box>

              {isAuthenticated || isTestUser ? (
                <Button
                  color="primary"
                  startIcon={<AccountCircleIcon />}
                  onClick={handleProfile}
                >
                  {isStaff ? "Staff" : (isTestUser ? "Test User" : "Profile")}
                </Button>
              ) : (
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleLogin}
                  startIcon={<PersonIcon />}
                >
                  Đăng nhập
                </Button>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* PHẦN DƯỚI: menu điều hướng */}
      <AppBar
        position="static"
        sx={{ background: "#202G99", boxShadow: "none" }}
      >
        <Toolbar sx={{ justifyContent: "center", minHeight: 0, py: 1 }}>
          <Stack direction="row" spacing={4}>
            {menuItems.map(
              (item) =>

                ((item.path === "/certificate" &&
                  (isAuthenticated || isTestUser)) ||
                  item.path !== "/certificate") && (
                  <NavButton
                    key={item.path}
                    component={StyledLink}
                    to={item.path}
                    isActive={location.pathname === item.path}
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: 18,
                      letterSpacing: 1,
                    }}
                    onClick={(e) => {
                      if (
                        item.path === "/booking" &&

                        !isAuthenticated &&
                        !isTestUser
                      ) {
                        e.preventDefault(); // Prevent default navigation
                        navigate("/login");
                      }
                    }}
                  >
                    {item.label}
                  </NavButton>
                )
            )}
          </Stack>
        </Toolbar>
      </AppBar>

      <ContentContainer maxWidth="lg">
        <Outlet />
      </ContentContainer>
      <Snackbar
        open={openLocationSnackbar}
        autoHideDuration={10000}
        onClose={() => setOpenLocationSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setOpenLocationSnackbar(false)}
          severity="warning"
          sx={{ width: '100%' }}
        >
          {locationSnackbarMessage}
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              navigate('/profile?scrollToLocation=true');
              setOpenLocationSnackbar(false);
            }}
            sx={{ ml: 2, fontWeight: 'bold' }}
          >
            CẬP NHẬT NGAY
          </Button>
        </Alert>
      </Snackbar>
      <Footer />
    </MainContainer>
  );
};

export default MainLayout;

import React, { useState, useEffect } from "react";
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
  Avatar,
} from "@mui/material";
import axios from 'axios';
import { styled } from "@mui/material/styles";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import ArticleIcon from "@mui/icons-material/Article";
import ContactIcon from "@mui/icons-material/ContactMail";
import { logout, fetchUserProfile } from "../features/auth/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { selectIsAuthenticated, selectUser } from "../features/auth/authSlice";
import Footer from "../components/Footer";
import PersonIcon from "@mui/icons-material/Person";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import DashboardIcon from "@mui/icons-material/Dashboard";
import BloodtypeIcon from "@mui/icons-material/Bloodtype";
import AssignmentIcon from '@mui/icons-material/Assignment';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventIcon from '@mui/icons-material/Event';
import VerifiedIcon from '@mui/icons-material/Verified';
import EditNoteIcon from '@mui/icons-material/EditNote';
import NotificationBell from "../components/NotificationBell";

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
  marginTop: theme.spacing(8), // Thêm margin-top để tránh bị header che
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
  // currentUser bây giờ sẽ luôn có isDonor, isRecipient nếu đã vào UserProfile

  // Thêm log để kiểm tra user và role
  console.log('DEBUG currentUser:', currentUser);
  if (currentUser) {
    console.log('DEBUG currentUser.role:', currentUser.role);
  }

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

  useEffect(() => {
    if (currentUser && (currentUser.role === 'Staff' || currentUser.role === 'Admin')) {
      if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
        navigate('/manage-requests', { replace: true });
      }
    }
  }, [currentUser, location.pathname, navigate]);

  useEffect(() => {
    // Nếu đã đăng nhập, tự động fetch profile để đồng bộ loại tài khoản vào Redux
    if (authToken && currentUser) {
      dispatch(fetchUserProfile());
    }
  }, [authToken, currentUser, dispatch]);

  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.removeItem("isTestUser");
    localStorage.removeItem("isStaff");
    navigate("/home");
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
    if (currentUser && currentUser.isRecipient) {
      navigate("/user-profile-recipient");
    } else {
      navigate("/profile");
    }
  };

  // Kiểm tra trạng thái đăng nhập test user và staff
  const isTestUser = localStorage.getItem("isTestUser") === "true";
  const isStaff = localStorage.getItem("isStaff") === "true";

  let menuItems = [];
  console.log('DEBUG currentUser at menuItems:', currentUser);

  if (currentUser && currentUser.role === 'Staff') {
    menuItems = [
      { path: "/search-distance", label: "Tìm Kiếm", icon: <SearchIcon /> },
      { path: "/manage-blood-periods", label: "Quản lý đợt hiến máu", icon: <BloodtypeIcon /> },
      { path: "/manage-requests", label: "Quản Lý Yêu Cầu Hiến Máu", icon: <AssignmentIcon /> },
      { path: "/blood-inventory", label: "Quản lý kho máu", icon: <BloodtypeIcon /> },
      { path: "/transfusion-management", label: "Quản lý truyền máu", icon: <LocalHospitalIcon /> },
      { path: "/manage-article", label: "Quản lý tài liệu", icon: <MenuBookIcon /> },
      { path: "/manage-blog", label: "Quản lý blog", icon: <EditNoteIcon /> },
      { path: "/manage-blood-storage", label: "Quản lý kho máu (chi tiết)", icon: <BloodtypeIcon /> },
    ];
  } else if (currentUser && currentUser.role === 'Admin') {
    menuItems = [
      { path: "/search-distance", label: "Tìm Kiếm", icon: <SearchIcon /> },
      { path: "/hospital-location", label: "Sửa Vị Trí Bệnh Viện", icon: <LocalHospitalIcon /> },
      { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
      { path: "/manage-requests", label: "Quản Lý Yêu Cầu Hiến Máu", icon: <AssignmentIcon /> },
      { path: "/blood-inventory", label: "Quản lý kho máu", icon: <BloodtypeIcon /> },
      { path: "/transfusion-management", label: "Quản lý truyền máu", icon: <LocalHospitalIcon /> },
      { path: "/manage-article", label: "Quản lý tài liệu", icon: <MenuBookIcon /> },
      { path: "/manage-blog", label: "Quản lý blog", icon: <EditNoteIcon /> },
      { path: "/manage-blood-storage", label: "Quản lý kho máu (chi tiết)", icon: <BloodtypeIcon /> },
    ];
  } else {
    // Nếu chưa đăng nhập, chỉ hiện các mục cơ bản
    if (!isAuthenticated && !isTestUser) {
      menuItems = [
        { path: "/", label: "Trang Chủ", icon: <HomeIcon /> },
        { label: "Tin Tức", icon: <ArticleIcon />, isNews: true },
        { path: "/blog", label: "Blog", icon: <EditNoteIcon /> },
        { path: "/emergency-request", label: "Yêu Cầu Khẩn", icon: <LocalHospitalIcon /> },
      ];
    } else {
      menuItems = [
        { path: "/", label: "Trang Chủ", icon: <HomeIcon /> },
        { label: "Tin Tức", icon: <ArticleIcon />, isNews: true },
        { path: "/blog", label: "Blog", icon: <EditNoteIcon /> },
        { path: "/booking", label: "Đặt Lịch", icon: <EventIcon /> },
        { path: "/certificate", label: "Chứng Chỉ", icon: <VerifiedIcon /> },
        { path: "/emergency-request", label: "Yêu Cầu Khẩn", icon: <LocalHospitalIcon /> },
        { path: "/history", label: "Lịch Sử Đặt Hẹn", icon: <HistoryIcon /> },
      ];
    }
  }
  console.log('DEBUG menuItems render:', menuItems);

  console.log('DEBUG MainLayout mounted');

  // Thêm state cho menu Tin Tức (đặt ngoài mọi if)
  const [newsAnchorEl, setNewsAnchorEl] = useState(null);
  const openNewsMenu = Boolean(newsAnchorEl);
  const handleNewsMenu = (event) => setNewsAnchorEl(event.currentTarget);
  const handleCloseNewsMenu = () => setNewsAnchorEl(null);

  // Nếu là tài khoản truyền máu (isRecipient === true), chỉ hiển thị menu có 2 mục này
  if (currentUser && currentUser.isRecipient) {
    const recipientMenu = [
      { path: "/", label: "Trang Chủ" },
      { path: "/faq", label: "Hỏi & Đáp" },
      { path: "/article", label: "Tài Liệu Máu" },
      { path: "/blog", label: "Blog" },
      { path: "/booking-transfusion", label: "Đặt lịch truyền máu" },
      { path: "/transfusion-history", label: "Lịch Sử Truyền Máu" },
    ];
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {isAuthenticated || isTestUser ? (
                  <>
                    {/* Notification Bell - chỉ hiển thị cho Member */}
                    {currentUser && currentUser.role === 'Member' && (
                      <NotificationBell userId={currentUser.userId} />
                    )}
                    <Button
                      color="primary"
                      startIcon={
                        currentUser && currentUser.fullName ? (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main', fontWeight: 'bold' }}>
                            {currentUser.fullName.charAt(0).toUpperCase()}
                          </Avatar>
                        ) : (
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main', fontWeight: 'bold' }}>?</Avatar>
                        )
                      }
                      onClick={handleProfile}
                      sx={{ fontSize: 17, fontWeight: 'bold' }}
                    >
                      {isStaff ? "Staff" : (isTestUser ? "Test User" : "Hồ sơ")}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={handleLogin}
                    startIcon={<PersonIcon />}
                    sx={{ fontSize: 18 }}
                  >
                    Đăng nhập
                  </Button>
                )}
              </Box>
            </Box>
          </Container>
        </Box>

        {/* PHẦN DƯỚI: menu điều hướng cho recipient */}
        <AppBar
          position="static"
          sx={{ background: "#202G99", boxShadow: "none" }}
        >
          <Toolbar sx={{ justifyContent: "center", minHeight: 0, py: 1 }}>
            <Stack direction="row" spacing={4}>
              {recipientMenu.map((item) => (
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
                >
                  {item.label}
                </NavButton>
              ))}
            </Stack>
          </Toolbar>
        </AppBar>
        <ContentContainer maxWidth="lg">
          <Outlet />
        </ContentContainer>
      </MainContainer>
    );
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {isAuthenticated || isTestUser ? (
                <>
                  {/* Notification Bell - chỉ hiển thị cho Member */}
                  {currentUser && currentUser.role === 'Member' && (
                    <NotificationBell userId={currentUser.userId} />
                  )}
                  <Button
                    color="primary"
                    startIcon={
                      currentUser && currentUser.fullName ? (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main', fontWeight: 'bold' }}>
                          {currentUser.fullName.charAt(0).toUpperCase()}
                        </Avatar>
                      ) : (
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'error.main', fontWeight: 'bold' }}>?</Avatar>
                      )
                    }
                    onClick={handleProfile}
                    sx={{ fontSize: 17, fontWeight: 'bold' }}
                  >
                    {isStaff ? "Staff" : (isTestUser ? "Test User" : "Hồ sơ")}
                  </Button>
                </>
              ) : (
                <Button
                  variant="text"
                  color="primary"
                  onClick={handleLogin}
                  startIcon={<PersonIcon />}
                  sx={{ fontSize: 18 }}
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
            {menuItems.map((item) =>
              item.isNews ? (
                <div key="news-menu">
                  <NavButton
                    onClick={handleNewsMenu}
                    isActive={location.pathname.startsWith('/article') || location.pathname.startsWith('/faq')}
                    sx={{ color: "white", fontWeight: "bold", fontSize: 18, letterSpacing: 1 }}
                    startIcon={item.icon}
                  >
                    Tin Tức
                  </NavButton>
                  <Menu
                    anchorEl={newsAnchorEl}
                    open={openNewsMenu}
                    onClose={handleCloseNewsMenu}
                    MenuListProps={{ 'aria-labelledby': 'news-menu-button' }}
                  >
                    <MenuItem component={RouterLink} to="/article" onClick={handleCloseNewsMenu}>
                      <MenuBookIcon sx={{ mr: 1 }} /> Thông Tin
                    </MenuItem>
                    <MenuItem component={RouterLink} to="/faq" onClick={handleCloseNewsMenu}>
                      <QuestionAnswerIcon sx={{ mr: 1 }} /> Hỏi & Đáp
                    </MenuItem>
                  </Menu>
                </div>
              ) :
              ((item.path === "/certificate" && (isAuthenticated || isTestUser)) || item.path !== "/certificate") && (
                <NavButton
                  key={item.path}
                  component={StyledLink}
                  to={item.path}
                  isActive={location.pathname === item.path}
                  sx={{ color: "white", fontWeight: "bold", fontSize: 18, letterSpacing: 1 }}
                  onClick={(e) => {
                    if (item.path === "/booking" && !isAuthenticated && !isTestUser) {
                      e.preventDefault();
                      navigate("/login");
                    }
                  }}
                  startIcon={item.icon}
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

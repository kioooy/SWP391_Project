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
} from "@mui/material";
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
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

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
      <Footer />
    </MainContainer>
  );
};

export default MainLayout;

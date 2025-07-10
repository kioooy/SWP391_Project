import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Container } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AssignmentIcon from '@mui/icons-material/Assignment';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditNoteIcon from '@mui/icons-material/EditNote';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';
import VerifiedIcon from '@mui/icons-material/Verified';
import WorkflowIcon from '@mui/icons-material/AccountTree';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import { useSelector } from "react-redux";

const drawerWidth = 300;

const SidebarLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  // Các mục sidebar cho Staff/Admin
  const menuItems = [
    { path: user?.role === 'Admin' ? "/profile-admin" : user?.role === 'Staff' ? "/profile-staff" : "/profile", label: "Hồ sơ", icon: <PersonIcon /> },
    { path: "/dashboard", label: "Dashboard", icon: <DashboardIcon /> },
<<<<<<< Updated upstream
    { path: "/blood-workflow", label: "Truyền Máu", icon: <WorkflowIcon /> },
    { path: "/manage-requests", label: "Yêu cầu hiến máu", icon: <AssignmentIcon /> },
    { path: "/manage-urgent-request", label: "Yêu cầu khẩn", icon: <AssignmentIcon /> },
    // { path: "/transfusion-management", label: "Truyền máu", icon: <LocalHospitalIcon /> },
    { path: "/blood-search", label: "Tìm kiếm máu", icon: <BloodtypeIcon /> },
    { path: "/donor-mobilization", label: "Huy động người hiến", icon: <GroupIcon /> },
    { path: "/manage-blood-periods", label: "Đợt hiến máu", icon: <BloodtypeIcon /> },
    { path: "/blood-inventory", label: "Kho máu tổng hợp", icon: <BloodtypeIcon /> },
    // Chỉ admin mới thấy tài liệu và blog
    ...(user?.role === 'Admin' ? [
      { path: "/manage-article", label: "Tài liệu", icon: <MenuBookIcon /> },
      { path: "/manage-blog", label: "Blog", icon: <EditNoteIcon /> },
    ] : []),

=======
    { path: "/blood-workflow", label: "Truyền máu", icon: <WorkflowIcon /> },
    { path: "/manage-requests", label: "Yêu cầu", icon: <AssignmentIcon /> },
    { path: "/blood-search", label: "Tìm máu", icon: <BloodtypeIcon /> },
    { path: "/donor-mobilization", label: "Huy động", icon: <GroupIcon /> },
    { path: "/search-distance", label: "Tìm quanh bạn", icon: <LocationOnIcon /> },
    { path: "/search-by-distance", label: "Tìm nâng cao", icon: <SearchIcon /> },
    { path: "/manage-blood-periods", label: "Đợt hiến", icon: <BloodtypeIcon /> },
    { path: "/blood-inventory", label: "Kho máu", icon: <BloodtypeIcon /> },
    { path: "/manage-article", label: "Tài liệu", icon: <MenuBookIcon /> },
    { path: "/manage-blog", label: "Blog", icon: <EditNoteIcon /> },
>>>>>>> Stashed changes
    // { path: "/hospital-location", label: "Vị trí bệnh viện", icon: <LocalHospitalIcon /> },
    // { path: "/manage-roles", label: "Vai trò", icon: <PersonIcon /> },
    // { path: "/manage-users", label: "Người dùng", icon: <GroupIcon /> },
  ];

  // Nếu là Staff, ẩn một số mục chỉ dành cho Admin và ẩn cả blood-inventory, manage-blood-periods
  const filteredMenu = user?.role === 'Staff'
    ? menuItems.filter(item => !["/manage-roles", "/manage-users", "/dashboard", "/hospital-location", "/blood-inventory", "/manage-blood-periods"].includes(item.path))
    : menuItems;

  return (
    <Box sx={{ display: "flex", minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            background: '#fff',
            borderRight: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '2px 0 8px rgba(0,0,0,0.1)'
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight="bold" color="primary">Quản lý hệ thống</Typography>
        </Toolbar>
        <Divider />
        <List>
          {filteredMenu.map((item) => (
            <ListItem
              button
              key={item.path}
              selected={location.pathname.startsWith(item.path)}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                mx: 1,
                bgcolor: location.pathname.startsWith(item.path) ? 'primary.light' : 'inherit',
                color: location.pathname.startsWith(item.path) ? 'primary.main' : 'inherit',
                '&:hover': {
                  bgcolor: location.pathname.startsWith(item.path) ? 'primary.light' : 'rgba(0,0,0,0.04)',
                }
              }}
            >
              <ListItemIcon sx={{ color: '#E53935' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ noWrap: true }} />
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Box
          sx={{
            backgroundColor: '#fff',
            borderTopRightRadius: 16,
            borderBottomRightRadius: 16,
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            p: 3,
            minHeight: 'calc(100vh - 48px)',
            border: '1px solid rgba(0,0,0,0.08)',
            width: '100%',
            height: '100%',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarLayout; 